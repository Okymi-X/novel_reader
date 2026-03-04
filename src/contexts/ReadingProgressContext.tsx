"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
    const [history, setHistory] = useState<ReadingProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load history on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse reading history", e);
            }
        }
        setIsLoading(false);
    }, []);

    const saveProgress = useCallback((progress: Omit<ReadingProgress, 'timestamp'>) => {
        console.log("CONTEXT: saveProgress called with:", progress);
        setHistory(prev => {
            // Check if exact same progress is already latest to avoid re-renders
            if (prev.length > 0 &&
                prev[0].novelUrl === progress.novelUrl &&
                prev[0].paragraphIndex === progress.paragraphIndex) {
                console.log("CONTEXT: Duplicate progress, skipping update.");
                return prev;
            }

            // Remove existing entry for this novel if it exists
            const filtered = prev.filter(p => p.novelUrl !== progress.novelUrl);
            const newEntry = { ...progress, timestamp: Date.now() };
            const newHistory = [newEntry, ...filtered];

            console.log("CONTEXT: Updating history. New Length:", newHistory.length, "Latest Scanned:", newEntry);

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            } catch (e) {
                console.error("CONTEXT: Failed to save progress", e);
            }
            return newHistory;
        });
    }, []);

    const getProgress = useCallback((novelUrl: string) => {
        return history.find(p => p.novelUrl === novelUrl);
    }, [history]);

    const getLastRead = useCallback(() => {
        return history[0] || null;
    }, [history]);

    return (
        <ReadingProgressContext.Provider value={{ history, saveProgress, getProgress, getLastRead, isLoading }}>
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
