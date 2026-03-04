import * as cheerio from 'cheerio';
import { Chapter, Paragraph, NovelInfo, Volume, ChapterInfo } from '@/types';

// Helper to find the best content container by counting <p> tags
function findMainContentContainer($: cheerio.CheerioAPI): cheerio.Cheerio<any> | null {
    const commonSelectors = [
        'article', '.chapter-content', '#chapter-content', '.entry-content',
        '.epcontent', '#content', '.reading-content', '.text-content'
    ];

    for (const sel of commonSelectors) {
        const el = $(sel);
        if (el.length > 0 && el.find('p').length > 0) {
            return el.first();
        }
    }

    // Heuristic: Find the div with the most DIRECT <p> tags
    let bestContainer: cheerio.Cheerio<any> | null = null;
    let maxParagraphs = 0;

    $('div, section, main, article').each((_, el) => {
        const $el = $(el);
        const pCount = $el.children('p').length;
        if (pCount > maxParagraphs) {
            maxParagraphs = pCount;
            bestContainer = $el;
        }
    });

    return maxParagraphs > 2 ? bestContainer : null;
}

export async function fetchChapter(url: string): Promise<Chapter> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Generic Title Extraction
        let title = $('h1').first().text().trim();
        if (!title || title.length > 200) {
            title = $('.entry-title').first().text().trim() ||
                $('title').text().split(/[-|]/)[0].trim() ||
                "Unknown Chapter";
        }

        const paragraphs: Paragraph[] = [];

        // 2. Generic Content Extraction
        const contentContainer = findMainContentContainer($);

        if (contentContainer) {
            // Process children to keep mixed images and text in order
            contentContainer.contents().each((i, el) => {
                if (el.type === 'tag') {
                    const element = $(el);

                    if (el.name === 'p') {
                        // Check for images inside p
                        const img = element.find('img');
                        if (img.length > 0) {
                            const src = img.attr('src') || img.attr('data-src');
                            if (src && !src.startsWith('data:image')) {
                                paragraphs.push({
                                    id: `img-${i}`,
                                    text: img.attr('alt') || 'Image',
                                    type: 'image',
                                    imageUrl: src.startsWith('//') ? `https:${src}` : src
                                });
                            }
                        }

                        // Extract text minus inline scripts or styles
                        element.find('script, style, iframe').remove();
                        const text = element.text().trim();
                        // Ignore very short texts or obvious navigation elements
                        if (text && text.length > 2 && !text.toLowerCase().includes('chapter list') && !text.toLowerCase().includes('next chapter')) {
                            paragraphs.push({ id: `p-${i}`, text: text, type: 'text' });
                        }
                    } else if (el.name === 'img') {
                        const src = element.attr('src') || element.attr('data-src');
                        if (src && !src.startsWith('data:image')) {
                            paragraphs.push({
                                id: `img-${i}`, text: element.attr('alt') || 'Image', type: 'image',
                                imageUrl: src.startsWith('//') ? `https:${src}` : src
                            });
                        }
                    } else if (['div', 'span', 'h2', 'h3', 'h4'].includes(el.name)) {
                        // Sometimes content is just bare divs or headers
                        const text = element.text().trim();
                        if (text && text.length > 20) { // arbitrary length to filter out noise
                            paragraphs.push({ id: `text-${i}`, text: text, type: 'text' });
                        }
                    }
                } else if (el.type === 'text') {
                    // Raw text nodes
                    const text = (el.data || '').trim();
                    if (text && text.length > 15) {
                        paragraphs.push({ id: `raw-${i}`, text: text, type: 'text' });
                    }
                }
            });
        }

        // Fallback: Just grab all Ps if container logic failed
        if (paragraphs.length === 0) {
            $('p').each((i, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 10) {
                    paragraphs.push({ id: `fallback-p-${i}`, text, type: 'text' });
                }
            });
        }

        // 3. Generic Navigation Extraction
        // Next link heuristics
        let nextUrl = $('a[rel="next"]').attr('href');
        if (!nextUrl) {
            const nextLinks = $('a').filter((_, el) => {
                const text = $(el).text().toLowerCase();
                return ['next', 'suivant', 'suiv.', 'prochain', 'chapitre suivant', '>>'].some(k => text.includes(k));
            });
            nextUrl = nextLinks.first().attr('href');
        }

        // Prev link heuristics
        let prevUrl = $('a[rel="prev"]').attr('href');
        if (!prevUrl) {
            const prevLinks = $('a').filter((_, el) => {
                const text = $(el).text().toLowerCase();
                return ['prev', 'previous', 'précédent', 'prec.', 'chapitre précédent', '<<'].some(k => text.includes(k));
            });
            prevUrl = prevLinks.first().attr('href');
        }

        // Resolve relative URLs
        const resolveUrl = (link?: string) => {
            if (!link || link === '#' || link.startsWith('javascript:')) return undefined;
            try { return new URL(link, url).href; } catch { return link; }
        };

        return {
            title,
            paragraphs,
            nextUrl: resolveUrl(nextUrl),
            prevUrl: resolveUrl(prevUrl)
        };
    } catch (error) {
        console.error("Scraper Error (Chapter):", error);
        throw error;
    }
}

export async function fetchNovelInfo(url: string): Promise<NovelInfo> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            },
            cache: 'no-store'
        });

        if (!response.ok) throw new Error(`Failed to fetch novel info: ${response.statusText}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Generic Metadata Extraction
        let title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim();
        if (!title || title.length > 150) {
            title = $('title').text().split(/[-|]/)[0].trim() || "Unknown Novel";
        }

        let cover = $('meta[property="og:image"]').attr('content') ||
            $('.summary_image img').attr('src') ||
            $('.novel-cover img').attr('src') ||
            $('img').filter((_, el) => {
                const src = $(el).attr('src') || '';
                return src.includes('cover') || src.includes('thumb');
            }).first().attr('src') || '';

        if (cover && cover.startsWith('//')) cover = `https:${cover}`;
        if (cover && cover.startsWith('/')) {
            try { cover = new URL(cover, url).href; } catch { }
        }

        let author = $('meta[name="author"]').attr('content') ||
            $('.author-content a, .author a, [href*="author"], .ds-ct-name').first().text().trim();

        if (!author || author.length > 80) {
            const authorEl = $('*:contains("Author"), *:contains("Auteur")').filter((_, el) => $(el).children().length === 0).last();
            if (authorEl.length) {
                const nextText = authorEl.next().text().trim();
                const parentText = authorEl.parent().text().replace(/author:|auteur:/i, '').trim();
                author = nextText || parentText;
            }
        }
        if (!author || author.length > 80) author = "Inconnu";

        let status = "En cours";
        const statusEl = $('*:contains("Status"), *:contains("Statut")').filter((_, el) => $(el).children().length === 0).last();
        if (statusEl.length) {
            const nextText = statusEl.next().text().trim();
            if (nextText && nextText.length < 30) status = nextText;
        }

        const volumes: Volume[] = [];

        // 2. Generic Chapter List Extraction
        const allChapters: ChapterInfo[] = [];

        // Find containers that likely hold chapter lists
        const listContainers = $('.eplister, .chapter-list, .l-chapters, ul.main').length > 0
            ? $('.eplister, .chapter-list, .l-chapters, ul.main')
            : $('ul, ol, div').filter((_, el) => $(el).find('a').length > 5); // Fallback: any container with many links

        // Let's just flatten all chapter links we can find that look like chapters
        const seenUrls = new Set<string>();

        listContainers.first().find('a').each((_, link) => {
            const $link = $(link);
            const chapUrl = $link.attr('href');
            const chapTitle = $link.text().trim();

            if (chapUrl && !seenUrls.has(chapUrl) && !chapUrl.includes('#') && chapTitle) {
                // Heuristic: Does it look like a chapter link?
                // Either the URL contains 'chapter' or 'chapitre' or the title does, or it ends in numbers
                const isLikelyChapter = /chap(ter|itre)|vol(ume)?|-c?\d+/i.test(chapUrl) ||
                    /chap(ter|itre)|vol(ume)?\s*\d+/i.test(chapTitle);

                // Or if it's in a dedicated list container, just assume it's a chapter
                if (isLikelyChapter || listContainers.length > 0) {
                    try {
                        const absoluteUrl = new URL(chapUrl, url).href;
                        seenUrls.add(absoluteUrl);
                        allChapters.push({
                            title: chapTitle.replace(/\s+/g, ' '), // Clean up whitespace
                            url: absoluteUrl,
                            date: $link.parent().find('.date, .time').text().trim() || undefined
                        });
                    } catch {
                        // Ignore invalid URLs
                    }
                }
            }
        });

        // Ensure chronological order if it seems reversed (e.g. Ch1 is last)
        if (allChapters.length > 1) {
            const firstChapNum = allChapters[0].title.match(/\d+/);
            const lastChapNum = allChapters[allChapters.length - 1].title.match(/\d+/);
            if (firstChapNum && lastChapNum && parseInt(firstChapNum[0]) > parseInt(lastChapNum[0])) {
                allChapters.reverse();
            }
        }

        if (allChapters.length > 0) {
            volumes.push({
                title: "Tous les chapitres",
                chapters: allChapters
            });
        }

        return { title, cover, author, status, volumes };

    } catch (error) {
        console.error("Scraper Error (Novel Info):", error);
        throw error;
    }
}
