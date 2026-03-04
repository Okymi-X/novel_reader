import { NodeFetchHttpClient } from './src/infrastructure/http/NodeFetchHttpClient';
import { GenericWebNovelParser } from './src/infrastructure/parsers/strategies/GenericWebNovelParser';
import { WebNovelRepository } from './src/infrastructure/repositories/WebNovelRepository';

async function test() {
    const http = new NodeFetchHttpClient();
    const parser = new GenericWebNovelParser();
    const repo = new WebNovelRepository(http, parser);
    const info = await repo.getNovelInfo('https://lightnovelfr.com/series/lord-of-the-mysteries/');
    console.log('Total chapters parsed:', info.volumes.reduce((acc, vol) => acc + vol.chapters.length, 0));
    if (info.volumes.length && info.volumes[0].chapters.length > 0) {
        console.log('First 3:', info.volumes[0].chapters.slice(0, 3).map(c => c.title).join(' | '));
        console.log('Last 3:', info.volumes[0].chapters.slice(-3).map(c => c.title).join(' | '));
    }
}
test().catch(console.error);
