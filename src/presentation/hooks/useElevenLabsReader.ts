import { useState, useEffect, useRef, useCallback } from 'react';
import { Paragraph } from '@/types';
import { TTSProvider, ElevenLabsVoice, ELEVENLABS_VOICES } from '@/types/tts';
import { elevenLabsService } from '@/infrastructure/tts/ElevenLabsService';

interface AudioReaderConfig {
    provider: TTSProvider;
    rate: number;
    pitch: number;
    // Browser TTS
    browserVoice: SpeechSynthesisVoice | null;
    // ElevenLabs
    elevenLabsVoiceId: string;
    stability: number;
    similarityBoost: number;
}

interface UseElevenLabsReaderReturn {
    currentIndex: number;
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
    // Provider
    provider: TTSProvider;
    setProvider: (provider: TTSProvider) => void;
    isElevenLabsAvailable: boolean;
    // Common settings
    rate: number;
    setRate: (rate: number) => void;
    pitch: number;
    setPitch: (pitch: number) => void;
    // Browser TTS
    browserVoices: SpeechSynthesisVoice[];
    selectedBrowserVoice: SpeechSynthesisVoice | null;
    setBrowserVoiceByName: (name: string) => void;
    // ElevenLabs
    elevenLabsVoices: ElevenLabsVoice[];
    selectedElevenLabsVoice: ElevenLabsVoice | null;
    setElevenLabsVoice: (voiceId: string) => void;
    stability: number;
    setStability: (value: number) => void;
    similarityBoost: number;
    setSimilarityBoost: (value: number) => void;
    // Playback controls
    togglePlay: () => void;
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    seekTo: (index: number) => void;
    setParagraph: (index: number) => void;
}

export function useElevenLabsReader(paragraphs: Paragraph[]): UseElevenLabsReaderReturn {
    // Playback state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Provider state
    const [provider, setProvider] = useState<TTSProvider>('browser');
    const [isElevenLabsAvailable, setIsElevenLabsAvailable] = useState(false);

    // Common settings
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);

    // Browser TTS state
    const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<SpeechSynthesisVoice | null>(null);

    // ElevenLabs state
    const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>(ELEVENLABS_VOICES);
    const [selectedElevenLabsVoice, setSelectedElevenLabsVoice] = useState<ElevenLabsVoice | null>(
        ELEVENLABS_VOICES[0] || null
    );
    const [stability, setStability] = useState(0.5);
    const [similarityBoost, setSimilarityBoost] = useState(0.75);

    // Refs
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isCancelledRef = useRef(false);
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check ElevenLabs availability on mount
    useEffect(() => {
        elevenLabsService.checkAvailability().then(setIsElevenLabsAvailable);
    }, []);

    // Load ElevenLabs voices
    useEffect(() => {
        if (isElevenLabsAvailable) {
            elevenLabsService.fetchVoices().then(voices => {
                if (voices.length > 0) {
                    setElevenLabsVoices(voices);
                    if (!selectedElevenLabsVoice) {
                        setSelectedElevenLabsVoice(voices[0]);
                    }
                }
            });
        }
    }, [isElevenLabsAvailable, selectedElevenLabsVoice]);

    // Initialize browser voices
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();
            const frVoices = available.filter(v => v.lang.startsWith("fr"));
            const sortedVoices = [...frVoices].sort((a, b) => {
                const aIsPremium = a.name.includes("Natural") || a.name.includes("Online") || a.name.includes("Enhanced");
                const bIsPremium = b.name.includes("Natural") || b.name.includes("Online") || b.name.includes("Enhanced");
                if (aIsPremium && !bIsPremium) return -1;
                if (!aIsPremium && bIsPremium) return 1;
                return 0;
            });

            const finalVoices = sortedVoices.length > 0 ? sortedVoices : available;
            setBrowserVoices(finalVoices);

            if (!selectedBrowserVoice && finalVoices.length > 0) {
                setSelectedBrowserVoice(finalVoices[0]);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [selectedBrowserVoice]);

    // Keep-alive for browser TTS
    const stopKeepAlive = useCallback(() => {
        if (keepAliveRef.current) {
            clearInterval(keepAliveRef.current);
            keepAliveRef.current = null;
        }
    }, []);

    const startKeepAlive = useCallback(() => {
        stopKeepAlive();
        keepAliveRef.current = setInterval(() => {
            if (window.speechSynthesis?.speaking && !window.speechSynthesis.paused) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 5000);
    }, [stopKeepAlive]);

    // Stop all playback
    const stopPlayback = useCallback(() => {
        isCancelledRef.current = true;
        stopKeepAlive();

        // Stop browser TTS
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // Stop ElevenLabs audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [stopKeepAlive]);

    // Speak with browser TTS
    const speakBrowser = useCallback((text: string, onEnd: () => void) => {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (selectedBrowserVoice) {
            utterance.voice = selectedBrowserVoice;
        }

        utterance.onend = () => {
            if (!isCancelledRef.current) {
                onEnd();
            }
        };

        utterance.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.error("[Browser TTS] Error:", e);
                setError('Erreur de synthèse vocale');
                setIsPlaying(false);
            }
            stopKeepAlive();
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        startKeepAlive();
    }, [rate, pitch, selectedBrowserVoice, startKeepAlive, stopKeepAlive]);

    // Speak with ElevenLabs
    const speakElevenLabs = useCallback(async (text: string, onEnd: () => void) => {
        if (!selectedElevenLabsVoice) {
            setError('Aucune voix ElevenLabs sélectionnée');
            return;
        }

        const options = {
            voiceId: selectedElevenLabsVoice.voice_id,
            stability,
            similarityBoost,
        };

        // Check if already cached (from prefetch)
        const isCached = elevenLabsService.isAudioCached(text, options);
        if (!isCached) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const audioUrl = await elevenLabsService.generateAudio(text, options);

            if (isCancelledRef.current) return;

            const audio = new Audio(audioUrl);
            audio.playbackRate = rate;
            audioRef.current = audio;

            audio.onended = () => {
                if (!isCancelledRef.current) {
                    onEnd();
                }
            };

            audio.onerror = () => {
                if (!isCancelledRef.current) {
                    setError('Erreur de lecture audio');
                    setIsPlaying(false);
                }
            };

            await audio.play();
        } catch (err) {
            if (!isCancelledRef.current) {
                const message = err instanceof Error ? err.message : 'Erreur inconnue';
                setError(message);
                setIsPlaying(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedElevenLabsVoice, stability, similarityBoost, rate]);

    // Prefetch upcoming paragraphs when index changes
    useEffect(() => {
        if (provider === 'elevenlabs' && isElevenLabsAvailable && selectedElevenLabsVoice && isPlaying) {
            elevenLabsService.prefetchParagraphs(
                paragraphs,
                currentIndex,
                {
                    voiceId: selectedElevenLabsVoice.voice_id,
                    stability,
                    similarityBoost,
                }
            );
        }
    }, [currentIndex, provider, isElevenLabsAvailable, selectedElevenLabsVoice, stability, similarityBoost, paragraphs, isPlaying]);

    // Speak paragraph
    const speakParagraph = useCallback((index: number) => {
        isCancelledRef.current = true;
        stopPlayback();

        setTimeout(() => {
            isCancelledRef.current = false;

            if (index >= paragraphs.length) {
                setIsPlaying(false);
                return;
            }

            const paragraph = paragraphs[index];
            if (!paragraph || paragraph.type === 'image' || !paragraph.text?.trim()) {
                setCurrentIndex(prev => prev + 1);
                return;
            }

            const onEnd = () => {
                setCurrentIndex(prev => prev + 1);
            };

            if (provider === 'elevenlabs' && isElevenLabsAvailable) {
                speakElevenLabs(paragraph.text, onEnd);
            } else {
                speakBrowser(paragraph.text, onEnd);
            }
        }, 100);
    }, [paragraphs, provider, isElevenLabsAvailable, speakBrowser, speakElevenLabs, stopPlayback]);

    // Main playback effect
    useEffect(() => {
        if (isPlaying && paragraphs.length > 0) {
            speakParagraph(currentIndex);
        } else if (!isPlaying) {
            stopPlayback();
        }
    }, [isPlaying, currentIndex, speakParagraph, paragraphs.length, stopPlayback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlayback();
            elevenLabsService.clearCache();
        };
    }, [stopPlayback]);

    // Re-speak on settings change
    useEffect(() => {
        if (isPlaying) {
            speakParagraph(currentIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, rate, pitch, selectedBrowserVoice, selectedElevenLabsVoice, stability, similarityBoost]);

    // Voice setters
    const setBrowserVoiceByName = useCallback((name: string) => {
        const voice = browserVoices.find(v => v.name === name);
        if (voice) setSelectedBrowserVoice(voice);
    }, [browserVoices]);

    const setElevenLabsVoice = useCallback((voiceId: string) => {
        const voice = elevenLabsVoices.find(v => v.voice_id === voiceId);
        if (voice) setSelectedElevenLabsVoice(voice);
    }, [elevenLabsVoices]);

    // Controls
    const togglePlay = () => setIsPlaying(!isPlaying);
    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);
    const next = () => setCurrentIndex(prev => Math.min(prev + 1, paragraphs.length - 1));
    const prev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));
    const seekTo = (index: number) => {
        setCurrentIndex(index);
        if (!isPlaying) setIsPlaying(true);
    };

    return {
        currentIndex,
        isPlaying,
        isLoading,
        error,
        provider,
        setProvider,
        isElevenLabsAvailable,
        rate,
        setRate,
        pitch,
        setPitch,
        browserVoices,
        selectedBrowserVoice,
        setBrowserVoiceByName,
        elevenLabsVoices,
        selectedElevenLabsVoice,
        setElevenLabsVoice,
        stability,
        setStability,
        similarityBoost,
        setSimilarityBoost,
        togglePlay,
        play,
        pause,
        next,
        prev,
        seekTo,
        setParagraph: setCurrentIndex,
    };
}
