export interface Paragraph {
    id: string;
    text: string;
    type?: 'text' | 'image';
    imageUrl?: string;
}

export interface Chapter {
    title: string;
    paragraphs: Paragraph[];
    nextUrl?: string;
    prevUrl?: string;
}

export interface ChapterInfo {
    title: string;
    url: string;
    date?: string;
}

export interface Volume {
    title: string;
    chapters: ChapterInfo[];
}

export interface NovelInfo {
    title: string;
    cover: string;
    author?: string;
    status?: string;
    volumes: Volume[];
}
