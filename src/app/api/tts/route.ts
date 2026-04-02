import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

function getApiKey(): string | null {
    return process.env.ELEVENLABS_API_KEY || null;
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'TTS service not configured' },
                { status: 503 }
            );
        }

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

        // Text length limit
        const MAX_TEXT_LENGTH = 5000;
        if (text.length > MAX_TEXT_LENGTH) {
            return NextResponse.json(
                { success: false, error: `Text exceeds ${MAX_TEXT_LENGTH} character limit` },
                { status: 400 }
            );
        }

        // Call ElevenLabs REST API directly
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: modelId || 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: stability ?? 0.5,
                        similarity_boost: similarityBoost ?? 0.75,
                        style: style ?? 0.0,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TTS API] ElevenLabs error:', response.status, errorText);
            
            if (response.status === 401) {
                return NextResponse.json(
                    { success: false, error: 'Invalid API key' },
                    { status: 401 }
                );
            }
            if (response.status === 429) {
                return NextResponse.json(
                    { success: false, error: 'API quota exceeded' },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { success: false, error: `ElevenLabs error: ${response.status}` },
                { status: response.status }
            );
        }

        // Get audio buffer
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            audio: base64Audio,
            mimeType: 'audio/mpeg',
        });

    } catch (error) {
        console.error('[TTS API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: `Failed to generate audio: ${errorMessage}` },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch available voices
export async function GET() {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'TTS service not configured' },
                { status: 503 }
            );
        }

        // Call ElevenLabs REST API directly
        const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[TTS API] ElevenLabs voices error:', response.status, errorText);
            return NextResponse.json(
                { success: false, error: `Failed to fetch voices: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const voices = data.voices || [];

        // Format voices
        const formattedVoices = voices.map((voice: Record<string, unknown>) => ({
            voice_id: voice.voice_id,
            name: voice.name,
            category: voice.category || 'custom',
            description: voice.description,
            labels: voice.labels,
            preview_url: voice.preview_url,
        }));

        return NextResponse.json({
            success: true,
            voices: formattedVoices,
        });

    } catch (error) {
        console.error('[TTS API] Error fetching voices:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: `Failed to fetch voices: ${errorMessage}` },
            { status: 500 }
        );
    }
}
