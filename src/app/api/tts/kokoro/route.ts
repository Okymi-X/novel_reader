import { NextRequest, NextResponse } from 'next/server';

// Kokoro TTS via Hugging Face Inference API
// Using the official Gradio API for hexgrad/Kokoro-TTS space
const HF_SPACE_URL = 'https://hexgrad-kokoro-tts.hf.space';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, voiceId = 'af_heart', speed = 1.0 } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Text is required' },
                { status: 400 }
            );
        }

        // Limit text length (Kokoro works best with shorter segments)
        const truncatedText = text.slice(0, 500);

        // Use Gradio API call format (newer version)
        // First, get the session hash
        const sessionId = `kokoro_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        // Step 1: Join the queue
        const joinResponse = await fetch(`${HF_SPACE_URL}/gradio_api/queue/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [truncatedText, voiceId, 'cpu', speed],
                fn_index: 0,
                session_hash: sessionId,
            }),
        });

        if (!joinResponse.ok) {
            // Try alternate endpoint format
            const altResponse = await fetch(`${HF_SPACE_URL}/run/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: [truncatedText, voiceId, 'cpu', speed],
                    session_hash: sessionId,
                }),
            });

            if (!altResponse.ok) {
                console.error('Kokoro API unavailable');
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Kokoro TTS service is currently unavailable. Please try Browser TTS instead.',
                        fallback: true 
                    },
                    { status: 503 }
                );
            }

            const altResult = await altResponse.json();
            if (altResult.data && altResult.data[0]) {
                return NextResponse.json({
                    success: true,
                    audioUrl: altResult.data[0].url || altResult.data[0],
                });
            }
        }

        // Step 2: Poll for result via data endpoint
        let attempts = 0;
        const maxAttempts = 60; // 30 seconds max

        while (attempts < maxAttempts) {
            const dataResponse = await fetch(`${HF_SPACE_URL}/gradio_api/queue/data?session_hash=${sessionId}`, {
                headers: {
                    'Accept': 'text/event-stream',
                },
            });

            if (dataResponse.ok) {
                const text = await dataResponse.text();
                const lines = text.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.msg === 'process_completed' && data.output?.data) {
                                const audioData = data.output.data[0];
                                if (audioData?.url) {
                                    return NextResponse.json({
                                        success: true,
                                        audioUrl: audioData.url,
                                    });
                                }
                            }
                        } catch (e) {
                            // Continue parsing
                        }
                    }
                }
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return NextResponse.json(
            { 
                success: false, 
                error: 'Timeout waiting for audio generation. Please try again.',
                fallback: true 
            },
            { status: 504 }
        );

    } catch (error) {
        console.error('Kokoro TTS error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Kokoro TTS service error. Please try Browser TTS.',
                fallback: true 
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Return available voices
    const voices = [
        { id: 'ff_siwis', name: 'Siwis (FR)', language: 'fr', gender: 'female' },
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

    return NextResponse.json({ success: true, voices });
}
