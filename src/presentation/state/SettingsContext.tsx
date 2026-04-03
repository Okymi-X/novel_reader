"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/utils/useLocalStorage';
import { TTSProvider } from '@/types/tts';

export interface AppSettings {
    theme: 'paper' | 'light' | 'dark' | 'sepia';
    fontFamily: 'sans' | 'serif';
    fontSize: number;
    rate: number;
    pitch: number;
    voiceName: string;
    // TTS Provider settings
    ttsProvider: TTSProvider;
    elevenLabsVoiceId: string;
    elevenLabsStability: number;
    elevenLabsSimilarityBoost: number;
    kokoroVoiceId: string;
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
    // TTS Provider defaults
    ttsProvider: 'browser',
    elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte (French)
    elevenLabsStability: 0.5,
    elevenLabsSimilarityBoost: 0.75,
    kokoroVoiceId: 'ff_siwis', // French voice (Siwis)
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
