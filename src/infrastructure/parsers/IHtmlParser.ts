import { Novel, Chapter } from '../../core/entities/Novel';

export interface IHtmlParser {
    /**
     * Extrait les informations du roman depuis le HTML de la page d'accueil du roman
     */
    parseNovelInfo(html: string, sourceUrl: string): Novel;

    /**
     * Extrait le contenu du chapitre depuis le HTML de la page du chapitre
     */
    parseChapter(html: string, sourceUrl: string): Chapter;
}
