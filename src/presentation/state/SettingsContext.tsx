"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/utils/useLocalStorage';

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
    const {
        storedValue: settings,
        setValue: setSettings,
        isInitialized
    } = useLocalStorage<AppSettings>(SETTINGS_KEY, defaultSettings);

    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    }, [setSettings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading: !isInitialized }}>
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
