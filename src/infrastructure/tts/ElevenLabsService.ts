import { ELEVENLABS_VOICES, ElevenLabsVoice } from '@/types/tts';

interface GenerateAudioOptions {
    voiceId: string;
    stability?: number;
    similarityBoost?: number;
}

interface AudioCacheEntry {
    audioUrl: string;
    timestamp: number;
}

// Client-side service for ElevenLabs TTS
export class ElevenLabsService {
    private static instance: ElevenLabsService;
    private audioCache: Map<string, AudioCacheEntry> = new Map();
    private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly MAX_CACHE_SIZE = 50;

    private constructor() {}

    static getInstance(): ElevenLabsService {
        if (!ElevenLabsService.instance) {
            ElevenLabsService.instance = new ElevenLabsService();
        }
        return ElevenLabsService.instance;
    }

    // Generate cache key from text and voice settings
    private getCacheKey(text: string, options: GenerateAudioOptions): string {
        return `${options.voiceId}:${text.substring(0, 100)}:${text.length}`;
    }

    // Clean expired cache entries
    private cleanCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.audioCache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                URL.revokeObjectURL(entry.audioUrl);
                this.audioCache.delete(key);
            }
        }

        // Limit cache size
        if (this.audioCache.size > this.MAX_CACHE_SIZE) {
            const entries = Array.from(this.audioCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
            for (const [key, entry] of toRemove) {
                URL.revokeObjectURL(entry.audioUrl);
                this.audioCache.delete(key);
            }
        }
    }

    // Generate audio from text via server API
    async generateAudio(
        text: string,
        options: GenerateAudioOptions
    ): Promise<string> {
        if (!text.trim()) {
            throw new Error('Text cannot be empty');
        }

        const cacheKey = this.getCacheKey(text, options);

        // Check cache first
        const cached = this.audioCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.audioUrl;
        }

        // Call server API
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                voiceId: options.voiceId,
                stability: options.stability,
                similarityBoost: options.similarityBoost,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to generate audio');
        }

        // Convert base64 to blob URL
        const audioBlob = this.base64ToBlob(data.audio, data.mimeType || 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);

        // Cache the result
        this.cleanCache();
        this.audioCache.set(cacheKey, {
            audioUrl,
            timestamp: Date.now(),
        });

        return audioUrl;
    }

    // Convert base64 string to Blob
    private base64ToBlob(base64: string, mimeType: string): Blob {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    // Get default voices (built-in list)
    getDefaultVoices(): ElevenLabsVoice[] {
        return ELEVENLABS_VOICES;
    }

    // Fetch voices from API (includes user's custom voices)
    async fetchVoices(): Promise<ElevenLabsVoice[]> {
        try {
            const response = await fetch('/api/tts');
            const data = await response.json();

            if (!response.ok || !data.success) {
                console.warn('[ElevenLabs] Failed to fetch voices, using defaults');
                return this.getDefaultVoices();
            }

            return data.voices;
        } catch {
            console.warn('[ElevenLabs] Error fetching voices, using defaults');
            return this.getDefaultVoices();
        }
    }

    // Check if ElevenLabs is configured
    async checkAvailability(): Promise<boolean> {
        try {
            const response = await fetch('/api/tts');
            const data = await response.json();
            return response.ok && data.success;
        } catch {
            return false;
        }
    }

    // Clear all cached audio
    clearCache(): void {
        for (const entry of this.audioCache.values()) {
            URL.revokeObjectURL(entry.audioUrl);
        }
        this.audioCache.clear();
    }
}

export const elevenLabsService = ElevenLabsService.getInstance();
