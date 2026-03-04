import { Novel, Chapter } from '../entities/Novel';

export interface INovelRepository {
    /**
     * Récupère les informations globales d'un roman (titre, chapitres, etc.)
     * @param url Identifiant ou URL du roman
     */
    getNovelInfo(url: string): Promise<Novel>;

    /**
     * Récupère le contenu d'un chapitre spécifique
     * @param url Identifiant ou URL du chapitre
     */
    getChapter(url: string): Promise<Chapter>;
}
