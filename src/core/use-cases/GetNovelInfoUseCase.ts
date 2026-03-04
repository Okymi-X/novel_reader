import { INovelRepository } from '../repositories/INovelRepository';
import { Novel } from '../entities/Novel';

export class GetNovelInfoUseCase {
    constructor(private readonly novelRepository: INovelRepository) { }

    async execute(url: string): Promise<Novel> {
        if (!url) {
            throw new Error("URL is required to fetch novel info");
        }
        return await this.novelRepository.getNovelInfo(url);
    }
}
