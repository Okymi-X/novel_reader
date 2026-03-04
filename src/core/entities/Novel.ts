export interface Paragraph {
    id: string;
    text: string;
    type?: 'text' | 'image';
    imageUrl?: string;
}

export interface Chapter {
    title: string;
    paragraphs: Paragraph[];
    nextUrl?: string; // URL relative ou ID
    prevUrl?: string; // URL relative ou ID
}

export interface ChapterInfo {
    title: string;
    url: string;      // Identifiant unique ou URL relative
    date?: string;
}

export interface Volume {
    title: string;
    chapters: ChapterInfo[];
}

export interface Novel {
    id: string;       // Identifiant unique
    url: string;      // URL source
    title: string;
    cover: string;
    author?: string;
    status?: string;
    volumes: Volume[];
}
