"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/utils/useLocalStorage';

export interface ReadingProgress {
    novelUrl: string;
    novelTitle: string;
    chapterUrl: string;
    chapterTitle: string;
    paragraphIndex: number;
    timestamp: number;
}

interface ReadingProgressContextType {
    history: ReadingProgress[];
    saveProgress: (progress: Omit<ReadingProgress, 'timestamp'>) => void;
    getProgress: (novelUrl: string) => ReadingProgress | undefined;
    getLastRead: () => ReadingProgress | null;
    isLoading: boolean;
}

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);
const STORAGE_KEY = 'litverse_progress';

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
    const {
        storedValue: history,
        setValue: setHistory,
        isInitialized
    } = useLocalStorage<ReadingProgress[]>(STORAGE_KEY, []);

    const saveProgress = useCallback((progress: Omit<ReadingProgress, 'timestamp'>) => {
        setHistory(prev => {
            if (prev.length > 0 &&
                prev[0].novelUrl === progress.novelUrl &&
                prev[0].paragraphIndex === progress.paragraphIndex) {
                return prev; // Évite les re-renders inutiles
            }

            const filtered = prev.filter(p => p.novelUrl !== progress.novelUrl);
            const newEntry = { ...progress, timestamp: Date.now() };
            return [newEntry, ...filtered];
        });
    }, [setHistory]);

    const getProgress = useCallback((novelUrl: string) => {
        return history.find(p => p.novelUrl === novelUrl);
    }, [history]);

    const getLastRead = useCallback(() => {
        return history[0] || null;
    }, [history]);

    return (
        <ReadingProgressContext.Provider value={{ history, saveProgress, getProgress, getLastRead, isLoading: !isInitialized }}>
            {children}
        </ReadingProgressContext.Provider>
    );
}

export function useReadingProgress() {
    const context = useContext(ReadingProgressContext);
    if (context === undefined) {
        throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
    }
    return context;
}
