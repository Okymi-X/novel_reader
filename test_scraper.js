const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('chapter.html', 'utf-8');
const $ = cheerio.load(html);

function findMainContentContainer($) {
    let bestContainer = null;
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

const c = findMainContentContainer($);
console.log('Container class:', c ? c.attr('class') || c.prop('tagName') : 'none');
console.log('Direct children P:', c ? c.children('p').length : 0);
console.log('First P text:', c && c.children('p').first().text());
