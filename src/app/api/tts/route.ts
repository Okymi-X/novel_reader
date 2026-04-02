import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Server-side ElevenLabs client (secure - API key not exposed)
function getElevenLabsClient(): ElevenLabsClient | null {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('[TTS API] ELEVENLABS_API_KEY not configured');
        return null;
    }
    return new ElevenLabsClient({ apiKey });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voiceId, modelId, stability, similarityBoost, style } = body;

        // Validation
        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Text is required' },
                { status: 400 }
            );
        }

        if (!voiceId || typeof voiceId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Voice ID is required' },
                { status: 400 }
            );
        }

        // Text length limit (ElevenLabs has limits, plus cost consideration)
        const MAX_TEXT_LENGTH = 5000;
        if (text.length > MAX_TEXT_LENGTH) {
            return NextResponse.json(
                { success: false, error: `Text exceeds ${MAX_TEXT_LENGTH} character limit` },
                { status: 400 }
            );
        }

        const client = getElevenLabsClient();
        if (!client) {
            return NextResponse.json(
                { success: false, error: 'TTS service not configured' },
                { status: 503 }
            );
        }

        // Generate audio with ElevenLabs
        const audioStream = await client.textToSpeech.convert(voiceId, {
            text,
            modelId: modelId || 'eleven_multilingual_v2',
            outputFormat: 'mp3_44100_128',
            voiceSettings: {
                stability: stability ?? 0.5,
                similarityBoost: similarityBoost ?? 0.75,
                style: style ?? 0.0,
            },
        });

        // Convert stream to buffer using the Web Streams API
        const chunks: Uint8Array[] = [];
        const reader = audioStream.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }
        
        const audioBuffer = Buffer.concat(chunks);

        // Return audio as base64 for client-side playback
        const base64Audio = audioBuffer.toString('base64');

        return NextResponse.json({
            success: true,
            audio: base64Audio,
            mimeType: 'audio/mpeg',
        });

    } catch (error) {
        console.error('[TTS API] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle specific ElevenLabs errors
        if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            return NextResponse.json(
                { success: false, error: 'API quota exceeded' },
                { status: 429 }
            );
        }

        if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
            return NextResponse.json(
                { success: false, error: 'Invalid API key' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to generate audio' },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch available voices
export async function GET() {
    try {
        const client = getElevenLabsClient();
        if (!client) {
            return NextResponse.json(
                { success: false, error: 'TTS service not configured' },
                { status: 503 }
            );
        }

        const response = await client.voices.getAll();
        const voices = response.voices || [];

        // Filter and format voices
        const formattedVoices = voices.map(voice => ({
            voice_id: voice.voiceId,
            name: voice.name,
            category: voice.category || 'custom',
            description: voice.description,
            labels: voice.labels,
        }));

        return NextResponse.json({
            success: true,
            voices: formattedVoices,
        });

    } catch (error) {
        console.error('[TTS API] Error fetching voices:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch voices' },
            { status: 500 }
        );
    }
}
