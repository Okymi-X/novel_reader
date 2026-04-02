import { ELEVENLABS_VOICES, ElevenLabsVoice } from '@/types/tts';

interface GenerateAudioOptions {
    voiceId: string;
    stability?: number;
    similarityBoost?: number;
}

interface AudioCacheEntry {
    audioUrl: string;
    timestamp: number;
    status: 'pending' | 'ready' | 'error';
}

interface PrefetchRequest {
    text: string;
    options: GenerateAudioOptions;
    priority: number;
}

// Client-side service for ElevenLabs TTS with intelligent prefetching
export class ElevenLabsService {
    private static instance: ElevenLabsService;
    private audioCache: Map<string, AudioCacheEntry> = new Map();
    private prefetchQueue: PrefetchRequest[] = [];
    private isPrefetching = false;
    private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly MAX_CACHE_SIZE = 100;
    private readonly PREFETCH_AHEAD = 3; // Number of paragraphs to prefetch

    private constructor() {}

    static getInstance(): ElevenLabsService {
        if (!ElevenLabsService.instance) {
            ElevenLabsService.instance = new ElevenLabsService();
        }
        return ElevenLabsService.instance;
    }

    private getCacheKey(text: string, options: GenerateAudioOptions): string {
        return `${options.voiceId}:${text.substring(0, 100)}:${text.length}`;
    }

    private cleanCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.audioCache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                if (entry.audioUrl) URL.revokeObjectURL(entry.audioUrl);
                this.audioCache.delete(key);
            }
        }

        if (this.audioCache.size > this.MAX_CACHE_SIZE) {
            const entries = Array.from(this.audioCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
            for (const [key, entry] of toRemove) {
                if (entry.audioUrl) URL.revokeObjectURL(entry.audioUrl);
                this.audioCache.delete(key);
            }
        }
    }

    // Check if audio is cached and ready
    isAudioCached(text: string, options: GenerateAudioOptions): boolean {
        const cacheKey = this.getCacheKey(text, options);
        const cached = this.audioCache.get(cacheKey);
        return cached?.status === 'ready' && Date.now() - cached.timestamp < this.CACHE_TTL;
    }

    // Prefetch upcoming paragraphs
    prefetchParagraphs(
        paragraphs: Array<{ text: string; type?: string }>,
        currentIndex: number,
        options: GenerateAudioOptions
    ): void {
        // Clear existing prefetch queue
        this.prefetchQueue = [];

        // Queue next N paragraphs for prefetching
        for (let i = 1; i <= this.PREFETCH_AHEAD; i++) {
            const idx = currentIndex + i;
            if (idx >= paragraphs.length) break;

            const paragraph = paragraphs[idx];
            if (!paragraph || paragraph.type === 'image' || !paragraph.text?.trim()) continue;

            const cacheKey = this.getCacheKey(paragraph.text, options);
            const cached = this.audioCache.get(cacheKey);

            // Skip if already cached or being fetched
            if (cached && (cached.status === 'ready' || cached.status === 'pending')) continue;

            this.prefetchQueue.push({
                text: paragraph.text,
                options,
                priority: i,
            });
        }

        // Start prefetching
        this.processPrefetchQueue();
    }

    private async processPrefetchQueue(): Promise<void> {
        if (this.isPrefetching || this.prefetchQueue.length === 0) return;

        this.isPrefetching = true;

        while (this.prefetchQueue.length > 0) {
            const request = this.prefetchQueue.shift();
            if (!request) break;

            try {
                await this.generateAudioInternal(request.text, request.options, true);
            } catch {
                // Silently fail prefetch - it's not critical
            }

            // Small delay between prefetch requests to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.isPrefetching = false;
    }

    private async generateAudioInternal(
        text: string,
        options: GenerateAudioOptions,
        isPrefetch: boolean = false
    ): Promise<string> {
        const cacheKey = this.getCacheKey(text, options);

        // Check cache
        const cached = this.audioCache.get(cacheKey);
        if (cached?.status === 'ready' && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.audioUrl;
        }

        // Mark as pending
        this.audioCache.set(cacheKey, {
            audioUrl: '',
            timestamp: Date.now(),
            status: 'pending',
        });

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
            this.audioCache.set(cacheKey, {
                audioUrl: '',
                timestamp: Date.now(),
                status: 'error',
            });
            throw new Error(data.error || 'Failed to generate audio');
        }

        const audioBlob = this.base64ToBlob(data.audio, data.mimeType || 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);

        this.cleanCache();
        this.audioCache.set(cacheKey, {
            audioUrl,
            timestamp: Date.now(),
            status: 'ready',
        });

        if (!isPrefetch) {
            console.log(`[ElevenLabs] Audio generated for: "${text.substring(0, 30)}..."`);
        }

        return audioUrl;
    }

    async generateAudio(text: string, options: GenerateAudioOptions): Promise<string> {
        if (!text.trim()) {
            throw new Error('Text cannot be empty');
        }
        return this.generateAudioInternal(text, options, false);
    }

    private base64ToBlob(base64: string, mimeType: string): Blob {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    getDefaultVoices(): ElevenLabsVoice[] {
        return ELEVENLABS_VOICES;
    }

    async fetchVoices(): Promise<ElevenLabsVoice[]> {
        try {
            const response = await fetch('/api/tts');
            const data = await response.json();

            if (!response.ok || !data.success) {
                return this.getDefaultVoices();
            }

            return data.voices;
        } catch {
            return this.getDefaultVoices();
        }
    }

    async checkAvailability(): Promise<boolean> {
        try {
            const response = await fetch('/api/tts');
            const data = await response.json();
            return response.ok && data.success;
        } catch {
            return false;
        }
    }

    clearCache(): void {
        for (const entry of this.audioCache.values()) {
            if (entry.audioUrl) URL.revokeObjectURL(entry.audioUrl);
        }
        this.audioCache.clear();
        this.prefetchQueue = [];
    }

    cancelPrefetch(): void {
        this.prefetchQueue = [];
    }
}

export const elevenLabsService = ElevenLabsService.getInstance();
