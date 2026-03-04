<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black.svg?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  
  <br />
  <br />
  
  <h1>📖 Novel Reader</h1>
  <p>
    Une application web open-source moderne de lecture et d'écoute de romans web (Light Novels, Webnovels).<br/>
    Créée par <strong>Okymi-X</strong> pour les passionnés de lecture.
  </p>
  
  <strong>[ <a href="#déploiement-sur-vercel">Déployer sur Vercel</a> ]</strong>
</div>

---

## ✨ Fonctionnalités Principales

* **🎧 Smart Audio TTS (Voix Réalistes) :** Le lecteur intègre un moteur intelligent qui déverrouille et force l'utilisation des "Voix Premium / Neuronales" natives (Google Online, Siri, Microsoft Natural) cachées dans le système de l'utilisateur, offrant un résultat ultra-réaliste **gratuitement et sans API externe**.
* **📱 Interface Native UI :** Navigation pensée pour mobile avec un Bottom Navigation Bar translucide (façon iOS) et une expérience PWA parfaite.
* **⚡ Clean Architecture :** Le projet est rigoureusement structuré sous les préceptes de la Clean Architecture (Domaine, Infrastructures, Use Cases) assurant une maintenabilité exceptionnelle et facilitant l'intégration de nouveaux parsers.
* **🎨 Thèmes Visuels :** Personnalisation complète (Papier, Clair, Sombre, Sépia) et contrôles typographiques complets (Sans-Serif/Serif, taille du texte dynamique).
* **📚 Scraping en Temps Réel :** Parsing dynamique intelligent du contenu du chapitre cible et prédiction de la pagination suivante, capable de piocher sa base sur des sites partenaires supportés de façon fluide et optimisée.
* **💾 Hors-ligne & Historique :** Sauvegarde locale persistante des romans ajoutés à la "Bibliothèque" et enregistrement automatique des derniers chapitres lus.

## 🛠️ Installation en Local

Pour contribuer ou utiliser ce lecteur en local sur votre machine :

```bash
# 1. Cloner le projet
git clone https://github.com/Okymi-X/novel-reader.git
cd novel-reader

# 2. Installer les dépendances
npm install
# ou yarn install / pnpm install

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) et profitez de la lecture !

## 🚀 Déploiement sur Vercel

Le projet `Novel Reader` est propulsé par **Next.js**, il est donc extrêmement optimisé pour être déployé gratuitement et en un clic sur Vercel. 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOkymi-X%2Fnovel-reader)

### Étapes manuelles :
1. Poussez (*Push*) ce code sur votre propre repository GitHub public ou privé.
2. Allez sur **[Vercel.com](https://vercel.com/)** et connectez-vous avec GitHub.
3. Cliquez sur **Add New...** > **Project** et sélectionnez votre dépôt GitHub *novel-reader*.
4. Cliquez sur **Deploy** et patientez 1 minute.
5. C'est fait ! Votre application est en ligne et hébergée gratuitement, prête à être ajoutée à l'écran d'accueil de votre téléphone !

## 🏗️ Architecture Technique (Clean Architecture)
```
src/
 ├── domain/             # (Business Rules) Entités métiers (Novel, Paragraph)
 ├── _useCases/          # (Application Business Rules) ex: FetchChapterData()
 ├── infrastructure/     # (Frameworks & Drivers) Récupération & DOM Parsing, Axios...
 │   └── parsers/        # Stratégies d'extraction de contenu (HtmlParser, GenericParser)
 ├── presentation/       # (UI & Controllers) Hooks, State (Context), Tailwind styles
 ├── components/         # Composants React modulaires
 └── app/                # Next.js App Router (Pages principales)
```

## ❤️ Contribuer
Les contributions (Pull Requests) sont grandement appréciées, notamment si vous souhaitez ajouter de nouvelles stratégies logicielle dans `/infrastructure` ou de nouveaux Scraping Parsers pour intégrer le support de nouveaux sites de lecture !

---
*Créé avec passion par **Okymi-X** et rendu open-source pour la communauté littéraire du web.*
