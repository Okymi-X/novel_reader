import { KokoroVoice, KOKORO_VOICES } from '../../types/tts';

interface CacheEntry {
    blob: Blob;
    url: string;
    timestamp: number;
    status: 'pending' | 'ready' | 'error';
}

class KokoroService {
    private cache: Map<string, CacheEntry> = new Map();
    private pendingRequests: Map<string, Promise<string | null>> = new Map();
    private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly MAX_CACHE_SIZE = 100;
    private _isAvailable: boolean | null = null;

    // Generate cache key from text and voice
    private getCacheKey(text: string, voiceId: string): string {
        const normalized = text.trim().toLowerCase().slice(0, 100);
        let hash = 0;
        const str = `kokoro-${voiceId}-${normalized}`;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `kokoro-${Math.abs(hash).toString(16)}`;
    }

    // Check if audio is cached
    isAudioCached(text: string, voiceId: string): boolean {
        const key = this.getCacheKey(text, voiceId);
        const entry = this.cache.get(key);
        return entry?.status === 'ready' && Date.now() - entry.timestamp < this.CACHE_TTL;
    }

    // Check if Kokoro is available
    async checkAvailability(): Promise<boolean> {
        if (this._isAvailable !== null) return this._isAvailable;
        
        try {
            const response = await fetch('/api/tts/kokoro', { method: 'GET' });
            this._isAvailable = response.ok;
        } catch {
            this._isAvailable = false;
        }
        
        return this._isAvailable;
    }

    // Get available voices
    getVoices(): KokoroVoice[] {
        return KOKORO_VOICES;
    }

    // Clean expired cache entries
    private cleanCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                if (entry.url) {
                    URL.revokeObjectURL(entry.url);
                }
                this.cache.delete(key);
            }
        }

        // Also trim if over max size
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toDelete = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
            for (const [key, entry] of toDelete) {
                if (entry.url) {
                    URL.revokeObjectURL(entry.url);
                }
                this.cache.delete(key);
            }
        }
    }

    // Generate speech with Kokoro (free HF Space)
    async speak(text: string, voiceId: string = 'af_heart', speed: number = 1.0): Promise<string | null> {
        const key = this.getCacheKey(text, voiceId);

        // Check cache first
        const cached = this.cache.get(key);
        if (cached?.status === 'ready' && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log('[Kokoro] Cache hit:', key);
            return cached.url;
        }

        // Check if already pending
        if (this.pendingRequests.has(key)) {
            console.log('[Kokoro] Waiting for pending request:', key);
            return this.pendingRequests.get(key)!;
        }

        // Start new request
        const promise = this.generateAudio(text, voiceId, speed, key);
        this.pendingRequests.set(key, promise);

        try {
            const result = await promise;
            return result;
        } finally {
            this.pendingRequests.delete(key);
        }
    }

    private async generateAudio(text: string, voiceId: string, speed: number, cacheKey: string): Promise<string | null> {
        console.log('[Kokoro] Generating audio for:', text.slice(0, 50) + '...');

        // Mark as pending in cache
        this.cache.set(cacheKey, {
            blob: new Blob(),
            url: '',
            timestamp: Date.now(),
            status: 'pending'
        });

        try {
            const response = await fetch('/api/tts/kokoro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId, speed }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Mark Kokoro as unavailable if it's a service error
                if (data.fallback) {
                    this._isAvailable = false;
                }
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            if (!data.audioUrl) {
                throw new Error('No audio URL returned');
            }

            // Fetch the audio from the returned URL (HF Space URL)
            const audioResponse = await fetch(data.audioUrl);
            if (!audioResponse.ok) {
                throw new Error('Failed to fetch audio file');
            }

            const blob = await audioResponse.blob();
            const localUrl = URL.createObjectURL(blob);

            // Update cache
            this.cache.set(cacheKey, {
                blob,
                url: localUrl,
                timestamp: Date.now(),
                status: 'ready'
            });

            this.cleanCache();
            console.log('[Kokoro] Audio generated and cached:', cacheKey);

            return localUrl;

        } catch (error) {
            console.error('[Kokoro] Error generating audio:', error);
            
            // Mark as error in cache
            this.cache.set(cacheKey, {
                blob: new Blob(),
                url: '',
                timestamp: Date.now(),
                status: 'error'
            });

            return null;
        }
    }

    // Prefetch multiple paragraphs
    async prefetchParagraphs(paragraphs: string[], voiceId: string, startIndex: number, count: number = 2): Promise<void> {
        // Don't prefetch if Kokoro is unavailable
        if (this._isAvailable === false) return;

        const toPrefetch = paragraphs.slice(startIndex + 1, startIndex + 1 + count)
            .filter(p => p.trim().length > 0);

        console.log(`[Kokoro] Prefetching ${toPrefetch.length} paragraphs`);

        for (const text of toPrefetch) {
            // Skip if already cached
            if (this.isAudioCached(text, voiceId)) {
                continue;
            }

            // Generate with low priority (add small delay)
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.speak(text, voiceId).catch(err => {
                console.warn('[Kokoro] Prefetch error:', err);
            });
        }
    }

    // Cancel all pending requests
    cancelPrefetch(): void {
        this.pendingRequests.clear();
    }

    // Clear all cache
    clearCache(): void {
        for (const entry of this.cache.values()) {
            if (entry.url) {
                URL.revokeObjectURL(entry.url);
            }
        }
        this.cache.clear();
        this.pendingRequests.clear();
    }

    // Get cache stats
    getCacheStats(): { size: number; ready: number; pending: number; error: number } {
        let ready = 0, pending = 0, error = 0;
        for (const entry of this.cache.values()) {
            if (entry.status === 'ready') ready++;
            else if (entry.status === 'pending') pending++;
            else error++;
        }
        return { size: this.cache.size, ready, pending, error };
    }
}

// Singleton instance
export const kokoroService = new KokoroService();
