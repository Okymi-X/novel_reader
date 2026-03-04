"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AppSettings {
    theme: 'paper' | 'light' | 'dark' | 'sepia';
    fontFamily: 'sans' | 'serif';
    fontSize: number;
    rate: number;
    pitch: number;
    voiceName: string;
}

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    isLoading: boolean;
}

const defaultSettings: AppSettings = {
    theme: 'paper',
    fontFamily: 'serif',
    fontSize: 18,
    rate: 1,
    pitch: 1,
    voiceName: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
const SETTINGS_KEY = 'litverse_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setIsLoading(false);
    }, []);

    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error("Failed to save settings", e);
            }
            return updated;
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within a SettingsProvider');
    }
    return context;
}
