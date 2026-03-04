import { INovelRepository } from '../repositories/INovelRepository';
import { Chapter } from '../entities/Novel';

export class GetChapterUseCase {
    constructor(private readonly novelRepository: INovelRepository) { }

    async execute(url: string): Promise<Chapter> {
        if (!url) {
            throw new Error("URL is required to fetch chapter");
        }
        return await this.novelRepository.getChapter(url);
    }
}
