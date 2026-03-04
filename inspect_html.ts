import * as cheerio from 'cheerio';

async function run() {
    console.log("Fetching Lord of the Mysteries...");
    const res = await fetch('https://lightnovelfr.com/series/lord-of-the-mysteries/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const listContainers = $('.eplister, .chapter-list, .l-chapters, ul.main');
    console.log('listContainers.length:', listContainers.length);
    if (listContainers.length > 0) {
        console.log('Links in listContainers:', listContainers.find('a').length);
    } else {
        const fallbackContainers = $('ul, ol, div').filter((_, el) => $(el).find('a').length > 5);
        console.log('Fallback containers length:', fallbackContainers.length);
        console.log('Fallback links:', fallbackContainers.find('a').length);
    }

    // Let's count how many links actually look like chapters
    const chapters = new Set();
    $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.includes('chap') || href.includes('vol') || $(el).text().toLowerCase().includes('chap'))) {
            chapters.add(href);
        }
    });
    console.log('Total chapter-like links on entire page:', chapters.size);
}
run().catch(console.error);
