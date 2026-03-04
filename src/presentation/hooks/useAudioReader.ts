import { useState, useEffect, useRef, useCallback } from 'react';
import { Paragraph } from '@/types';

export function useAudioReader(paragraphs: Paragraph[]) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);

    // Voice State
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isCancelledRef = useRef(false); // Flag to prevent onend cascade
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize Voices
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const loadVoices = () => {
            const available = window.speechSynthesis.getVoices();

            // 1. Filtrer pour ne garder que le Français
            const frVoices = available.filter(v => v.lang.startsWith("fr"));

            // 2. Trier pour mettre les voix Premium en premier (Google Online, Microsoft Natural, Apple Enhanced)
            const sortedVoices = [...frVoices].sort((a, b) => {
                const aIsPremium = a.name.includes("Natural") || a.name.includes("Online") || a.name.includes("Enhanced") || a.name.includes("Premium");
                const bIsPremium = b.name.includes("Natural") || b.name.includes("Online") || b.name.includes("Enhanced") || b.name.includes("Premium");
                if (aIsPremium && !bIsPremium) return -1;
                if (!aIsPremium && bIsPremium) return 1;
                return 0;
            });

            // S'il n'y a pas de voix FR, on fallback sur toutes les voix dispo (sorted)
            const finalVoices = sortedVoices.length > 0 ? sortedVoices : available;
            setVoices(finalVoices);

            if (!selectedVoice && finalVoices.length > 0) {
                // Le premier élément de sortedVoices est garanti d'être la meilleure voix disponible
                setSelectedVoice(finalVoices[0]);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [selectedVoice]);

    const stopKeepAlive = useCallback(() => {
        if (keepAliveRef.current) {
            clearInterval(keepAliveRef.current);
            keepAliveRef.current = null;
        }
    }, []);

    const startKeepAlive = useCallback(() => {
        stopKeepAlive();
        keepAliveRef.current = setInterval(() => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 5000);
    }, [stopKeepAlive]);

    const speakParagraph = useCallback((index: number) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Mark as cancelled so any pending onend from the PREVIOUS utterance is ignored
        isCancelledRef.current = true;
        window.speechSynthesis.cancel();
        stopKeepAlive();

        // Small delay to let the cancel settle before starting new speech
        setTimeout(() => {
            isCancelledRef.current = false; // Reset flag for the NEW utterance

            if (index >= paragraphs.length) {
                setIsPlaying(false);
                return;
            }

            const currentParagraph = paragraphs[index];
            if (!currentParagraph) {
                setIsPlaying(false);
                return;
            }

            // Skip images or empty text
            if (currentParagraph.type === 'image' || !currentParagraph.text?.trim()) {
                setCurrentIndex(prev => prev + 1);
                return;
            }

            console.log(`[Audio] Speaking paragraph ${index}: "${currentParagraph.text.substring(0, 50)}..."`);

            const utterance = new SpeechSynthesisUtterance(currentParagraph.text);
            utterance.rate = rate;
            utterance.pitch = pitch;

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.onend = () => {
                // CRITICAL: Only advance if this utterance wasn't cancelled
                if (!isCancelledRef.current) {
                    console.log(`[Audio] Paragraph ${index} finished naturally. Advancing...`);
                    setCurrentIndex(prev => prev + 1);
                } else {
                    console.log(`[Audio] Paragraph ${index} onend fired after cancel - ignoring.`);
                }
            };

            utterance.onerror = (e) => {
                if (e.error === 'interrupted' || e.error === 'canceled') {
                    return;
                }
                console.error("[Audio] TTS Error", e);
                stopKeepAlive();
                setIsPlaying(false);
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            startKeepAlive();
        }, 100); // 100ms delay to let cancel() finish
    }, [paragraphs, rate, pitch, selectedVoice, startKeepAlive, stopKeepAlive]);

    // Main playback effect
    useEffect(() => {
        if (isPlaying && paragraphs.length > 0) {
            speakParagraph(currentIndex);
        } else if (!isPlaying) {
            isCancelledRef.current = true;
            window.speechSynthesis.cancel();
            stopKeepAlive();
        }
    }, [isPlaying, currentIndex, speakParagraph, paragraphs.length, stopKeepAlive]);

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            isCancelledRef.current = true;
            window.speechSynthesis.cancel();
            stopKeepAlive();
        };
    }, [stopKeepAlive]);

    // Re-trigger speak if rate/voice/pitch changes while playing
    useEffect(() => {
        if (isPlaying) {
            speakParagraph(currentIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rate, pitch, selectedVoice]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);

    const next = () => setCurrentIndex(prev => Math.min(prev + 1, paragraphs.length - 1));
    const prev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

    const seekTo = (index: number) => {
        setCurrentIndex(index);
        if (!isPlaying) setIsPlaying(true);
    };

    const setVoiceByName = (name: string) => {
        const voice = voices.find(v => v.name === name);
        if (voice) setSelectedVoice(voice);
    };

    return {
        currentIndex,
        isPlaying,
        rate,
        setRate,
        pitch,
        setPitch,
        voices,
        selectedVoice,
        setVoiceByName,
        togglePlay,
        play,
        pause,
        next,
        prev,
        seekTo,
        setParagraph: setCurrentIndex
    };
}
