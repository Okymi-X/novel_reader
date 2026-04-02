"use client";

import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AudioWaveform } from "./audio/AudioWaveform";
import { ProgressBar } from "./audio/ProgressBar";
import { SettingsModal } from "./audio/SettingsModal";
import { TTSProvider, ElevenLabsVoice } from "@/types/tts";

interface AudioControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;

    // Progress
    currentParagraph: number;
    totalParagraphs: number;
    onSeek: (index: number) => void;

    // TTS Provider
    provider: TTSProvider;
    onProviderChange: (provider: TTSProvider) => void;
    isElevenLabsAvailable: boolean;

    // Browser TTS Settings
    rate: number;
    onRateChange: (rate: number) => void;
    pitch: number;
    onPitchChange: (pitch: number) => void;
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    onVoiceChange: (name: string) => void;

    // ElevenLabs Settings
    elevenLabsVoices: ElevenLabsVoice[];
    selectedElevenLabsVoice: ElevenLabsVoice | null;
    onElevenLabsVoiceChange: (voiceId: string) => void;
    stability: number;
    onStabilityChange: (value: number) => void;
    similarityBoost: number;
    onSimilarityBoostChange: (value: number) => void;

    // Novel Info
    title?: string;

    // Chapter Navigation
    hasNextChapter?: boolean;
    hasPrevChapter?: boolean;
    onNextChapter?: () => void;
    onPrevChapter?: () => void;

    // Visual Settings
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    theme: 'paper' | 'light' | 'dark' | 'sepia';
    onThemeChange: (theme: 'paper' | 'light' | 'dark' | 'sepia') => void;
    fontFamily: 'sans' | 'serif';
    onFontFamilyChange: (font: 'sans' | 'serif') => void;

    // Loading state
    isLoading?: boolean;
    error?: string | null;
}

export function AudioControls({
    isPlaying, onTogglePlay, onNext, onPrev,
    currentParagraph, totalParagraphs, onSeek,
    provider, onProviderChange, isElevenLabsAvailable,
    rate, onRateChange, pitch, onPitchChange, voices, selectedVoice, onVoiceChange,
    elevenLabsVoices, selectedElevenLabsVoice, onElevenLabsVoiceChange,
    stability, onStabilityChange, similarityBoost, onSimilarityBoostChange,
    fontSize, onFontSizeChange, theme, onThemeChange, fontFamily, onFontFamilyChange,
    title, hasNextChapter, hasPrevChapter, onNextChapter, onPrevChapter,
    isLoading, error
}: AudioControlsProps) {
    const [showSettings, setShowSettings] = useState(false);

    // Display voice name based on current provider
    const currentVoiceName = provider === 'elevenlabs'
        ? selectedElevenLabsVoice?.name || 'ElevenLabs'
        : selectedVoice?.name || 'Auto';

    return (
        <>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed bottom-0 left-0 right-0 md:left-72 z-40",
                    "bg-white/70 dark:bg-stone-900/80 backdrop-blur-2xl",
                    "border-t border-stone-200/50 dark:border-stone-700/50",
                    "shadow-[0_-8px_32px_rgba(0,0,0,0.08)]",
                )}
            >
                {/* Progress Bar Extracted */}
                <ProgressBar
                    currentParagraph={currentParagraph}
                    totalParagraphs={totalParagraphs}
                    onSeek={onSeek}
                />

                {/* Controls Row */}
                <div className="px-4 pb-4 pt-1">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Title + Waveform */}
                        <div className="hidden md:flex items-center gap-3 min-w-0 flex-1">
                            <AudioWaveform isPlaying={isPlaying} />
                            <div className="min-w-0">
                                <h4 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 truncate leading-tight">
                                    {title || "Novel Reader"}
                                </h4>
                                <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate flex items-center gap-1">
                                    {provider === 'elevenlabs' && (
                                        <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-primary text-[8px] text-white font-bold">AI</span>
                                    )}
                                    {currentVoiceName} · {rate}x · §{currentParagraph + 1}/{totalParagraphs}
                                </p>
                            </div>
                        </div>

                        {/* Mobile alignement spacer (balances the flex-1 setting block on the right) */}
                        <div className="flex-1 md:hidden"></div>

                        {/* Center: Transport Controls */}
                        <div className="flex items-center justify-center gap-2 md:gap-3">
                            <button
                                onClick={onPrevChapter} disabled={!hasPrevChapter}
                                className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                                title="Chapitre précédent"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button onClick={onPrev} className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-90">
                                <SkipBack className="w-5 h-5" />
                            </button>

                            <button
                                onClick={onTogglePlay}
                                disabled={isLoading}
                                className={cn(
                                    "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:scale-105",
                                    "bg-primary",
                                    "text-white disabled:opacity-70"
                                )}
                                style={{
                                    boxShadow: isPlaying
                                        ? '0 4px 20px color-mix(in srgb, var(--primary) 50%, transparent), 0 0 60px color-mix(in srgb, var(--primary) 15%, transparent)'
                                        : '0 4px 16px color-mix(in srgb, var(--primary) 30%, transparent)',
                                }}
                            >
                                {isPlaying && !isLoading && (
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                                        animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                                    />
                                )}
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin relative z-10" />
                                ) : isPlaying ? (
                                    <Pause className="w-6 h-6 text-white fill-current relative z-10" />
                                ) : (
                                    <Play className="w-6 h-6 text-white fill-current pl-0.5 relative z-10" />
                                )}
                            </button>

                            <button onClick={onNext} className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-90">
                                <SkipForward className="w-5 h-5" />
                            </button>

                            <button
                                onClick={onNextChapter} disabled={!hasNextChapter}
                                className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                                title="Chapitre suivant"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right: Settings */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            <button
                                onClick={() => {
                                    const speeds = [0.75, 1, 1.25, 1.5, 2];
                                    const nextIdx = (speeds.indexOf(rate) + 1) % speeds.length;
                                    onRateChange(speeds[nextIdx]);
                                }}
                                className={cn(
                                    "hidden md:flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all",
                                    "text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700"
                                )}
                            >
                                {rate}×
                            </button>
                            <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Settings Modal Extracted */}
            <SettingsModal
                show={showSettings}
                onClose={() => setShowSettings(false)}
                provider={provider}
                onProviderChange={onProviderChange}
                isElevenLabsAvailable={isElevenLabsAvailable}
                rate={rate} onRateChange={onRateChange}
                pitch={pitch} onPitchChange={onPitchChange}
                voices={voices} selectedVoice={selectedVoice} onVoiceChange={onVoiceChange}
                elevenLabsVoices={elevenLabsVoices}
                selectedElevenLabsVoice={selectedElevenLabsVoice}
                onElevenLabsVoiceChange={onElevenLabsVoiceChange}
                stability={stability}
                onStabilityChange={onStabilityChange}
                similarityBoost={similarityBoost}
                onSimilarityBoostChange={onSimilarityBoostChange}
                fontSize={fontSize} onFontSizeChange={onFontSizeChange}
                theme={theme} onThemeChange={onThemeChange}
                fontFamily={fontFamily} onFontFamilyChange={onFontFamilyChange}
                isLoading={isLoading}
                error={error}
            />
        </>
    );
}
