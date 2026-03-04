import { INovelRepository } from '../../core/repositories/INovelRepository';
import { Novel, Chapter } from '../../core/entities/Novel';
import { IHttpClient } from '../http/IHttpClient';
import { IHtmlParser } from '../parsers/IHtmlParser';

export class WebNovelRepository implements INovelRepository {
    constructor(
        private readonly httpClient: IHttpClient,
        private readonly htmlParser: IHtmlParser
    ) { }

    async getNovelInfo(url: string): Promise<Novel> {
        try {
            const html = await this.httpClient.get(url);
            return this.htmlParser.parseNovelInfo(html, url);
        } catch (error) {
            console.error(`Failed to fetch novel info at ${url}:`, error);
            throw error;
        }
    }

    async getChapter(url: string): Promise<Chapter> {
        try {
            const html = await this.httpClient.get(url);
            return this.htmlParser.parseChapter(html, url);
        } catch (error) {
            console.error(`Failed to fetch chapter at ${url}:`, error);
            throw error;
        }
    }
}
