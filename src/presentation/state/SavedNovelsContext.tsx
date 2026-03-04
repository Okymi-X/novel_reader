"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/utils/useLocalStorage';
import { Novel } from '../../core/entities/Novel';

// On utilise un type dérivé de Novel pour correspondre à l'ancienne interface, 
// ou on adapte pour utiliser directement l'entité Novel.
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
    const {
        storedValue: savedNovels,
        setValue: setSavedNovels,
        isInitialized
    } = useLocalStorage<SavedNovel[]>(SAVED_NOVELS_KEY, []);

    const addNovel = useCallback((novel: Omit<SavedNovel, 'addedAt'>) => {
        setSavedNovels(prev => {
            if (prev.some(n => n.url === novel.url)) return prev;
            return [{ ...novel, addedAt: Date.now() }, ...prev];
        });
    }, [setSavedNovels]);

    const removeNovel = useCallback((url: string) => {
        setSavedNovels(prev => prev.filter(n => n.url !== url));
    }, [setSavedNovels]);

    const isSaved = useCallback((url: string) => {
        return savedNovels.some(n => n.url === url);
    }, [savedNovels]);

    return (
        <SavedNovelsContext.Provider value={{ savedNovels, addNovel, removeNovel, isSaved, isLoading: !isInitialized }}>
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
