"use client";

import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings, X, Type, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;

    // Progress
    currentParagraph: number;
    totalParagraphs: number;
    onSeek: (index: number) => void;

    // Audio Settings
    rate: number;
    onRateChange: (rate: number) => void;
    pitch: number;
    onPitchChange: (pitch: number) => void;
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    onVoiceChange: (name: string) => void;

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
}

// Animated equalizer bars
function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
    return (
        <div className="flex items-end gap-[3px] h-4 mx-2">
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-primary to-primary/60"
                    animate={isPlaying ? {
                        height: ['4px', `${8 + Math.random() * 10}px`, '4px'],
                    } : { height: '4px' }}
                    transition={isPlaying ? {
                        repeat: Infinity,
                        duration: 0.4 + i * 0.12,
                        ease: 'easeInOut',
                        delay: i * 0.08,
                    } : { duration: 0.3 }}
                />
            ))}
        </div>
    );
}

export function AudioControls({
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    currentParagraph,
    totalParagraphs,
    onSeek,
    rate,
    onRateChange,
    pitch,
    onPitchChange,
    voices,
    selectedVoice,
    onVoiceChange,
    fontSize,
    onFontSizeChange,
    theme,
    onThemeChange,
    fontFamily,
    onFontFamilyChange,
    title,
    hasNextChapter,
    hasPrevChapter,
    onNextChapter,
    onPrevChapter
}: AudioControlsProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

    const progressPct = totalParagraphs > 0 ? ((currentParagraph + 1) / totalParagraphs) * 100 : 0;

    const handleProgressInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = x / rect.width;
        const idx = Math.round(pct * (totalParagraphs - 1));
        onSeek(Math.max(0, Math.min(totalParagraphs - 1, idx)));
    };

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
                {/* Progress Bar — Full Width, Top of Controls */}
                <div
                    ref={progressRef}
                    className="relative h-7 cursor-pointer group px-4 flex items-center"
                    onClick={handleProgressInteraction}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={(e) => isDragging && handleProgressInteraction(e)}
                >
                    {/* Track Background */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 group-hover:h-1.5 bg-stone-200/80 dark:bg-stone-700/60 rounded-full transition-all duration-200" />

                    {/* Active Track */}
                    <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-1 group-hover:h-1.5 rounded-full transition-all duration-200"
                        style={{
                            width: `calc(${progressPct}% - 2rem)`,
                            background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 70%, transparent))',
                        }}
                    />

                    {/* Thumb */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        style={{ left: `calc(1rem + ${progressPct}% - ${progressPct * 2 / 100}rem)` }}
                    >
                        <div className="w-3.5 h-3.5 bg-background rounded-full shadow-md border-2 border-primary" />
                    </div>

                    {/* Time Labels */}
                    <div className="absolute left-4 -top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500">{currentParagraph + 1}</span>
                    </div>
                    <div className="absolute right-4 -top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500">{totalParagraphs}</span>
                    </div>
                </div>

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
                                <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                                    {selectedVoice?.name || "Auto"} · {rate}x · §{currentParagraph + 1}/{totalParagraphs}
                                </p>
                            </div>
                        </div>

                        {/* Center: Transport Controls */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                onClick={onPrevChapter}
                                disabled={!hasPrevChapter}
                                className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                                title="Chapitre précédent"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={onPrev}
                                className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-90"
                            >
                                <SkipBack className="w-5 h-5" />
                            </button>

                            <button
                                onClick={onTogglePlay}
                                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:scale-105 bg-primary text-primary-foreground"
                                style={{
                                    boxShadow: isPlaying
                                        ? '0 4px 20px color-mix(in srgb, var(--primary) 50%, transparent), 0 0 60px color-mix(in srgb, var(--primary) 15%, transparent)'
                                        : '0 4px 16px color-mix(in srgb, var(--primary) 30%, transparent)',
                                }}
                            >
                                {/* Pulse ring when playing */}
                                {isPlaying && (
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                                        animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                                    />
                                )}
                                {isPlaying
                                    ? <Pause className="w-6 h-6 text-white fill-current relative z-10" />
                                    : <Play className="w-6 h-6 text-white fill-current pl-0.5 relative z-10" />
                                }
                            </button>

                            <button
                                onClick={onNext}
                                className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-90"
                            >
                                <SkipForward className="w-5 h-5" />
                            </button>

                            <button
                                onClick={onNextChapter}
                                disabled={!hasNextChapter}
                                className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                                title="Chapitre suivant"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right: Settings */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            {/* Speed Toggle (quick access) */}
                            <button
                                onClick={() => {
                                    const speeds = [0.75, 1, 1.25, 1.5, 2];
                                    const currentIdx = speeds.indexOf(rate);
                                    const nextIdx = (currentIdx + 1) % speeds.length;
                                    onRateChange(speeds[nextIdx]);
                                }}
                                className="hidden md:flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                            >
                                {rate}×
                            </button>

                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2.5 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 md:bottom-28 left-0 right-0 md:left-auto md:right-8 md:w-[420px] bg-white dark:bg-stone-900 rounded-t-3xl md:rounded-3xl shadow-2xl z-50 overflow-hidden border border-stone-100 dark:border-stone-800 max-h-[80vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">Paramètres</h3>
                                    <p className="text-xs text-stone-400 mt-0.5">Personnalisez votre lecture</p>
                                </div>
                                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-stone-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-7 overflow-y-auto">
                                {/* Voice & Audio */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <Volume2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Voix & Audio</span>
                                    </div>

                                    <select
                                        value={selectedVoice?.name || ""}
                                        onChange={(e) => onVoiceChange(e.target.value)}
                                        className="w-full p-3 rounded-2xl bg-muted/50 dark:bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border focus:border-primary/50 transition-all text-foreground"
                                    >
                                        {voices.map(v => (
                                            <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                                        ))}
                                    </select>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-muted-foreground">Vitesse</label>
                                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{rate}×</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="3" step="0.1"
                                                value={rate}
                                                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Ton</label>
                                                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{pitch}</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="2" step="0.1"
                                                value={pitch}
                                                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Appearance */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                            <Type className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Apparence</span>
                                    </div>

                                    {/* Font Family Selection */}
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <button
                                            onClick={() => onFontFamilyChange('sans')}
                                            className={cn(
                                                "py-2 rounded-xl text-sm transition-all duration-300 font-sans border",
                                                fontFamily === 'sans'
                                                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                                    : "border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/30"
                                            )}
                                        >
                                            Sans-Serif
                                        </button>
                                        <button
                                            onClick={() => onFontFamilyChange('serif')}
                                            className={cn(
                                                "py-2 rounded-xl text-sm transition-all duration-300 font-serif border",
                                                fontFamily === 'serif'
                                                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                                    : "border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/30"
                                            )}
                                        >
                                            Serif
                                        </button>
                                    </div>

                                    {/* Font Size */}
                                    <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-1.5 border border-border mb-2">
                                        <button
                                            onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
                                            className="p-2.5 hover:bg-background rounded-xl transition-all w-12 flex items-center justify-center active:scale-90 text-foreground/70"
                                        >
                                            <span className="text-xs font-bold">A−</span>
                                        </button>
                                        <span className="text-sm font-bold text-foreground tabular-nums">{fontSize}px</span>
                                        <button
                                            onClick={() => onFontSizeChange(Math.min(32, fontSize + 2))}
                                            className="p-2.5 hover:bg-background rounded-xl transition-all w-12 flex items-center justify-center active:scale-90 text-foreground/70"
                                        >
                                            <span className="text-lg font-bold">A+</span>
                                        </button>
                                    </div>

                                    {/* Theme */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {([
                                            { key: 'paper' as const, label: 'Papier', bg: '#F5E9D9', text: '#2D2D2D', dot: '#FF6B35' },
                                            { key: 'light' as const, label: 'Clair', bg: '#FFFFFF', text: '#1A1A1A', dot: '#94A3B8' },
                                            { key: 'dark' as const, label: 'Sombre', bg: '#1C1917', text: '#E7E5E4', dot: '#57534E' },
                                            { key: 'sepia' as const, label: 'Sepia', bg: '#F4ECD8', text: '#433422', dot: '#D9A05B' },
                                        ]).map(t => (
                                            <button
                                                key={t.key}
                                                onClick={() => onThemeChange(t.key)}
                                                className={cn(
                                                    "p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200",
                                                    theme === t.key
                                                        ? "border-primary shadow-md scale-[1.02]"
                                                        : "border-transparent hover:border-border opacity-70 hover:opacity-100"
                                                )}
                                                style={{ backgroundColor: t.bg }}
                                            >
                                                <div className="w-full h-8 rounded-lg flex flex-col gap-1 items-start justify-center px-2">
                                                    <div className="w-full h-1 rounded-full" style={{ backgroundColor: t.text, opacity: 0.3 }} />
                                                    <div className="w-3/4 h-1 rounded-full" style={{ backgroundColor: t.text, opacity: 0.15 }} />
                                                    <div className="w-1/2 h-1 rounded-full" style={{ backgroundColor: t.text, opacity: 0.1 }} />
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: t.text }}>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
