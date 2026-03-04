import * as cheerio from 'cheerio';
import { IHtmlParser } from '../IHtmlParser';
import { Novel, Chapter } from '../../../core/entities/Novel';

export class GenericWebNovelParser implements IHtmlParser {
    parseNovelInfo(html: string, sourceUrl: string): Novel {
        const $ = cheerio.load(html);

        // Cette logique est copiée de fetchNovelInfo dans lib/scraper.ts
        const title = $('h1').first().text().trim() ||
            $('.novel-title').first().text().trim() ||
            $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() ||
            'Unknown Title';

        let cover = $('.novel-cover img').attr('src') ||
            $('meta[property="og:image"]').attr('content') ||
            '';

        if (cover && !cover.startsWith('http')) {
            const baseUrl = new URL(sourceUrl).origin;
            cover = new URL(cover, baseUrl).href;
        }

        const author = $('.author').first().text().replace(/Author:?\s*/i, '').trim() ||
            $('meta[name="author"]').attr('content')?.trim() ||
            'Unknown Author';

        const status = $('.status').first().text().trim() ||
            $('.novel-status').first().text().trim() ||
            'Unknown';

        const chapters: { title: string; url: string; date?: string }[] = [];
        const seenUrls = new Set<string>();

        // Find containers that likely hold chapter lists
        const listContainers = $('.eplister, .chapter-list, .l-chapters, ul.main').length > 0
            ? $('.eplister, .chapter-list, .l-chapters, ul.main')
            : $('ul, ol, div').filter((_, el) => $(el).find('a').length > 5); // Fallback: any container with many links

        listContainers.find('a').each((_, link) => {
            const $link = $(link);
            const href = $link.attr('href');
            const chapTitle = $link.text().trim();

            if (href && !seenUrls.has(href) && !href.includes('#') && chapTitle) {
                // Heuristic: Does it look like a chapter link?
                // Either the URL contains 'chapter' or 'chapitre' or the title does, or it ends in numbers
                const isLikelyChapter = /chap(ter|itre)|vol(ume)?|-c?\d+/i.test(href) ||
                    /chap(ter|itre)|vol(ume)?\s*\d+/i.test(chapTitle);

                // Or if it's in a dedicated list container, just assume it's a chapter
                if (isLikelyChapter || listContainers.length > 0) {
                    try {
                        const absoluteUrl = this.resolveUrl(href, sourceUrl);
                        seenUrls.add(absoluteUrl);
                        chapters.push({
                            title: chapTitle.replace(/\s+/g, ' '),
                            url: absoluteUrl,
                            date: $link.parent().find('.date, .time').text().trim() || undefined
                        });
                    } catch {
                        // Ignore
                    }
                }
            }
        });

        // Ensure chronological order if it seems reversed (e.g. Ch1 is last)
        if (chapters.length > 1) {
            const firstChapNumMatch = chapters[0].title.match(/\d+/);
            const lastChapNumMatch = chapters[chapters.length - 1].title.match(/\d+/);
            const firstChapNum = firstChapNumMatch ? parseInt(firstChapNumMatch[0]) : null;
            const lastChapNum = lastChapNumMatch ? parseInt(lastChapNumMatch[0]) : null;

            if (firstChapNum !== null && lastChapNum !== null && firstChapNum > lastChapNum) {
                chapters.reverse();
            }
        }

        return {
            id: sourceUrl,
            url: sourceUrl,
            title,
            cover,
            author,
            status,
            volumes: chapters.length > 0 ? [{ title: "Tous les chapitres", chapters }] : []
        };
    }

    parseChapter(html: string, sourceUrl: string): Chapter {
        const $ = cheerio.load(html);

        // Suppression des éléments indésirables
        $('script, style, noscript, nav, header, footer, .ads, .comment-section, .pagination').remove();

        const title = $('h1').first().text().trim() ||
            $('.chapter-title').first().text().trim() ||
            $('meta[property="og:title"]').attr('content')?.split('|')[0].trim() ||
            'Untitled Chapter';

        const paragraphs: { id: string, text: string, type: 'text' | 'image', imageUrl?: string }[] = [];
        let pIndex = 0;

        const mainContent = this.findMainContentContainer($);

        if (mainContent && mainContent.length) {
            mainContent.find('p, img').each((_, el) => {
                const $el = $(el);

                if (el.name === 'img') {
                    const src = $el.attr('src') || $el.attr('data-src');
                    if (src) {
                        paragraphs.push({
                            id: `img-${pIndex++}`,
                            type: 'image',
                            text: $el.attr('alt') || '',
                            imageUrl: this.resolveUrl(src, sourceUrl)
                        });
                    }
                } else if (el.name === 'p') {
                    const text = $el.text().trim();
                    if (text && text.length > 0) {
                        paragraphs.push({
                            id: `p-${pIndex++}`,
                            type: 'text',
                            text
                        });
                    }
                }
            });
        }

        // Récupération des liens Next/Prev (Simplifié)
        let nextUrl, prevUrl;
        $('a').each((_, el) => {
            const $link = $(el);
            const text = $link.text().toLowerCase().trim();
            const href = $link.attr('href');

            if (!href || href === '#' || href.includes('javascript:')) return;

            if (/next|suivant|suiv|prochain/.test(text) || $link.attr('id')?.includes('next')) {
                nextUrl = this.resolveUrl(href, sourceUrl);
            }
            if (/prev|prec|précédent/.test(text) || $link.attr('id')?.includes('prev')) {
                prevUrl = this.resolveUrl(href, sourceUrl);
            }
        });

        return {
            title,
            paragraphs,
            nextUrl,
            prevUrl
        };
    }

    private resolveUrl(link: string, baseUrl: string): string {
        try {
            return new URL(link, baseUrl).href;
        } catch {
            return link;
        }
    }

    private findMainContentContainer($: cheerio.CheerioAPI): cheerio.Cheerio<any> | null {
        let maxP = 0;
        let bestContainer: cheerio.Cheerio<any> | null = null;
        const selectors = ['article', '.chapter-content', '#chapter-content', '.entry-content', '.content-body', 'main', '.post-content', '.reading-content'];

        for (const selector of selectors) {
            const $elem = $(selector);
            if ($elem.length > 0) return $elem.first();
        }

        $('div').each((_, el) => {
            const pCount = $(el).children('p').length;
            if (pCount > maxP) {
                maxP = pCount;
                bestContainer = $(el);
            }
        });

        return maxP > 0 ? bestContainer : null;
    }
}
