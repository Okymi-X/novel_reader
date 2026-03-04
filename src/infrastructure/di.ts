import { NodeFetchHttpClient } from '../infrastructure/http/NodeFetchHttpClient';
import { GenericWebNovelParser } from '../infrastructure/parsers/strategies/GenericWebNovelParser';
import { WebNovelRepository } from '../infrastructure/repositories/WebNovelRepository';
import { GetNovelInfoUseCase } from '../core/use-cases/GetNovelInfoUseCase';
import { GetChapterUseCase } from '../core/use-cases/GetChapterUseCase';

// Singleton pour les dépendances d'infrastructure
const httpClient = new NodeFetchHttpClient();
const htmlParser = new GenericWebNovelParser();
const novelRepository = new WebNovelRepository(httpClient, htmlParser);

// Exportation des Use Cases prêts à l'emploi
export const getNovelInfoUseCase = new GetNovelInfoUseCase(novelRepository);
export const getChapterUseCase = new GetChapterUseCase(novelRepository);
