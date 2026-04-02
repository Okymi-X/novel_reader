// TTS Provider Types
export type TTSProvider = 'browser' | 'elevenlabs';

export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    category: string;
    description?: string;
    preview_url?: string;
    labels?: Record<string, string>;
}

export interface TTSConfig {
    provider: TTSProvider;
    // Browser TTS settings
    browserVoiceName?: string;
    // ElevenLabs settings
    elevenLabsVoiceId?: string;
    elevenLabsVoiceName?: string;
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
