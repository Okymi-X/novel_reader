export interface IHttpClient {
    /**
     * Effectue une requête GET et retourne le texte de la réponse
     * @param url L'URL à récupérer
     */
    get(url: string): Promise<string>;
}
