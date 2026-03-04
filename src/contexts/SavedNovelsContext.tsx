"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface SavedNovel {
    url: string;
    title: string;
    cover: string;
    author: string;
    addedAt: number;
}

interface SavedNovelsContextType {
    savedNovels: SavedNovel[];
    addNovel: (novel: Omit<SavedNovel, 'addedAt'>) => void;
    removeNovel: (url: string) => void;
    isSaved: (url: string) => boolean;
    isLoading: boolean;
}

const SavedNovelsContext = createContext<SavedNovelsContextType | undefined>(undefined);
const SAVED_NOVELS_KEY = 'litverse_saved_novels';

export function SavedNovelsProvider({ children }: { children: React.ReactNode }) {
    const [savedNovels, setSavedNovels] = useState<SavedNovel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(SAVED_NOVELS_KEY);
        if (stored) {
            try {
                setSavedNovels(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved novels", e);
            }
        }
        setIsLoading(false);
    }, []);

    const addNovel = useCallback((novel: Omit<SavedNovel, 'addedAt'>) => {
        setSavedNovels(prev => {
            if (prev.some(n => n.url === novel.url)) return prev;
            const updated = [{ ...novel, addedAt: Date.now() }, ...prev];
            localStorage.setItem(SAVED_NOVELS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeNovel = useCallback((url: string) => {
        setSavedNovels(prev => {
            const updated = prev.filter(n => n.url !== url);
            localStorage.setItem(SAVED_NOVELS_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const isSaved = useCallback((url: string) => {
        return savedNovels.some(n => n.url === url);
    }, [savedNovels]);

    return (
        <SavedNovelsContext.Provider value={{ savedNovels, addNovel, removeNovel, isSaved, isLoading }}>
            {children}
        </SavedNovelsContext.Provider>
    );
}

export function useSavedNovels() {
    const context = useContext(SavedNovelsContext);
    if (context === undefined) {
        throw new Error('useSavedNovels must be used within a SavedNovelsProvider');
    }
    return context;
}
