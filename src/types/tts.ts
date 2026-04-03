// TTS Provider Types
export type TTSProvider = 'browser' | 'elevenlabs' | 'kokoro';

export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    category: string;
    description?: string;
    preview_url?: string;
    labels?: Record<string, string>;
}

export interface KokoroVoice {
    id: string;
    name: string;
    language: string;
    gender: 'male' | 'female';
}

export interface TTSConfig {
    provider: TTSProvider;
    // Browser TTS settings
    browserVoiceName?: string;
    // ElevenLabs settings
    elevenLabsVoiceId?: string;
    elevenLabsVoiceName?: string;
    // Kokoro settings
    kokoroVoiceId?: string;
    // Common settings
    rate: number;
    pitch: number;
    stability?: number;       // ElevenLabs: 0-1
    similarityBoost?: number; // ElevenLabs: 0-1
}

export interface TTSRequest {
    text: string;
    voiceId: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
}

export interface TTSResponse {
    success: boolean;
    audioUrl?: string;
    error?: string;
}

// Kokoro voices (French + English)
export const KOKORO_VOICES: KokoroVoice[] = [
    // French voices
    { id: 'ff_siwis', name: 'Siwis (FR)', language: 'fr', gender: 'female' },
    // English voices
    { id: 'af_heart', name: 'Heart', language: 'en', gender: 'female' },
    { id: 'af_bella', name: 'Bella', language: 'en', gender: 'female' },
    { id: 'af_nicole', name: 'Nicole', language: 'en', gender: 'female' },
    { id: 'af_sarah', name: 'Sarah', language: 'en', gender: 'female' },
    { id: 'af_sky', name: 'Sky', language: 'en', gender: 'female' },
    { id: 'am_adam', name: 'Adam', language: 'en', gender: 'male' },
    { id: 'am_michael', name: 'Michael', language: 'en', gender: 'male' },
    { id: 'bf_emma', name: 'Emma (UK)', language: 'en', gender: 'female' },
    { id: 'bf_isabella', name: 'Isabella (UK)', language: 'en', gender: 'female' },
    { id: 'bm_george', name: 'George (UK)', language: 'en', gender: 'male' },
    { id: 'bm_lewis', name: 'Lewis (UK)', language: 'en', gender: 'male' },
];

// Default ElevenLabs voices (popular French voices)
export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
    {
        voice_id: 'XB0fDUnXU5powFXDhCwa',
        name: 'Charlotte',
        category: 'premium',
        description: 'Voix féminine française naturelle',
        labels: { language: 'fr', gender: 'female' }
    },
    {
        voice_id: 'IKne3meq5aSn9XLyUdCD',
        name: 'Charlie',
        category: 'premium',
        description: 'Voix masculine française naturelle',
        labels: { language: 'fr', gender: 'male' }
    },
    {
        voice_id: 'XrExE9yKIg1WjnnlVkGX',
        name: 'Matilda',
        category: 'premium',
        description: 'Voix féminine expressive',
        labels: { language: 'fr', gender: 'female' }
    },
    {
        voice_id: 'onwK4e9ZLuTAKqWW03F9',
        name: 'Daniel',
        category: 'premium',
        description: 'Voix masculine profonde',
        labels: { language: 'fr', gender: 'male' }
    },
    {
        voice_id: 'JBFqnCBsd6RMkjVDRZzb',
        name: 'George',
        category: 'premium',
        description: 'Voix britannique charismatique',
        labels: { language: 'en', gender: 'male' }
    },
];

export const DEFAULT_ELEVENLABS_CONFIG = {
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
};
