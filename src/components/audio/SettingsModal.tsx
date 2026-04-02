import { X, Type, Volume2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TTSProvider, ElevenLabsVoice } from "@/types/tts";

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
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

export function SettingsModal({
    show, onClose,
    provider, onProviderChange, isElevenLabsAvailable,
    rate, onRateChange, pitch, onPitchChange,
    voices, selectedVoice, onVoiceChange,
    elevenLabsVoices, selectedElevenLabsVoice, onElevenLabsVoiceChange,
    stability, onStabilityChange, similarityBoost, onSimilarityBoostChange,
    fontSize, onFontSizeChange, theme, onThemeChange, fontFamily, onFontFamilyChange,
    isLoading, error
}: SettingsModalProps) {
    if (!show) return null;

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 md:bottom-28 left-0 right-0 md:left-auto md:right-8 md:w-[420px] bg-white dark:bg-stone-900 rounded-t-3xl md:rounded-3xl shadow-2xl z-50 overflow-hidden border border-stone-100 dark:border-stone-800 max-h-[80vh] flex flex-col"
                    >
                        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                            <div>
                                <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">Paramètres</h3>
                                <p className="text-xs text-stone-400 mt-0.5">Personnalisez votre lecture</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-stone-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-7 overflow-y-auto">
                            {/* Error Display */}
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {/* TTS Provider Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Moteur TTS</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onProviderChange('browser')}
                                        className={cn(
                                            "py-3 px-4 rounded-xl text-sm transition-all duration-300 border text-left",
                                            provider === 'browser'
                                                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                                : "border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/30"
                                        )}
                                    >
                                        <div className="font-semibold">Navigateur</div>
                                        <div className="text-[10px] opacity-70 mt-0.5">Gratuit</div>
                                    </button>
                                    <button
                                        onClick={() => isElevenLabsAvailable && onProviderChange('elevenlabs')}
                                        disabled={!isElevenLabsAvailable}
                                        className={cn(
                                            "py-3 px-4 rounded-xl text-sm transition-all duration-300 border text-left relative",
                                            provider === 'elevenlabs'
                                                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                                : isElevenLabsAvailable
                                                    ? "border-border/50 hover:border-primary/50 text-foreground/70 bg-muted/30"
                                                    : "border-border/30 text-foreground/30 bg-muted/10 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="font-semibold flex items-center gap-1.5">
                                            ElevenLabs
                                            {provider === 'elevenlabs' && isLoading && (
                                                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                        <div className="text-[10px] opacity-70 mt-0.5">
                                            {isElevenLabsAvailable ? 'Premium AI' : 'Non configuré'}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Voix & Audio */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Volume2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Voix & Audio</span>
                                </div>

                                {/* Voice Selection - Conditional based on provider */}
                                {provider === 'browser' ? (
                                    <select
                                        value={selectedVoice?.name || ""}
                                        onChange={(e) => onVoiceChange(e.target.value)}
                                        className="w-full p-3 rounded-2xl bg-muted/50 dark:bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border focus:border-primary/50 transition-all text-foreground"
                                    >
                                        {voices.map(v => {
                                            const isPremium = v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Enhanced") || v.name.includes("Premium");
                                            return (
                                                <option key={v.name} value={v.name}>
                                                    {isPremium ? "★ " : ""}{v.name} ({v.lang})
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <select
                                        value={selectedElevenLabsVoice?.voice_id || ""}
                                        onChange={(e) => onElevenLabsVoiceChange(e.target.value)}
                                        className="w-full p-3 rounded-2xl bg-primary/5 dark:bg-primary/10 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-primary/20 dark:border-primary/30 focus:border-primary/50 transition-all text-foreground"
                                    >
                                        {elevenLabsVoices.map(v => (
                                            <option key={v.voice_id} value={v.voice_id}>
                                                {v.name} {v.labels?.language ? `(${v.labels.language})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* Rate & Pitch (Browser) or ElevenLabs settings */}
                                {provider === 'browser' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-muted-foreground">Vitesse</label>
                                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{rate}×</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="3" step="0.1" value={rate}
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
                                                type="range" min="0.5" max="2" step="0.1" value={pitch}
                                                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-medium text-muted-foreground">Stabilité</label>
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{Math.round(stability * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="1" step="0.05" value={stability}
                                                    onChange={(e) => onStabilityChange(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-primary"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Plus stable = plus cohérent</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-medium text-muted-foreground">Clarté</label>
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{Math.round(similarityBoost * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="1" step="0.05" value={similarityBoost}
                                                    onChange={(e) => onSimilarityBoostChange(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-primary"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Plus haut = voix plus claire</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-muted-foreground">Vitesse</label>
                                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{rate}×</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="2" step="0.1" value={rate}
                                                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-primary"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Apparence */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <Type className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Apparence</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button
                                        onClick={() => onFontFamilyChange('sans')}
                                        className={cn(
                                            "py-2 rounded-xl text-sm transition-all duration-300 font-sans border",
                                            fontFamily === 'sans' ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" : "border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/30"
                                        )}
                                    >Sans-Serif</button>
                                    <button
                                        onClick={() => onFontFamilyChange('serif')}
                                        className={cn(
                                            "py-2 rounded-xl text-sm transition-all duration-300 font-serif border",
                                            fontFamily === 'serif' ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" : "border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/30"
                                        )}
                                    >Serif</button>
                                </div>

                                <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-1.5 border border-border mb-2">
                                    <button onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))} className="p-2.5 hover:bg-background rounded-xl transition-all w-12 flex items-center justify-center active:scale-90 text-foreground/70"><span className="text-xs font-bold">A−</span></button>
                                    <span className="text-sm font-bold text-foreground tabular-nums">{fontSize}px</span>
                                    <button onClick={() => onFontSizeChange(Math.min(32, fontSize + 2))} className="p-2.5 hover:bg-background rounded-xl transition-all w-12 flex items-center justify-center active:scale-90 text-foreground/70"><span className="text-lg font-bold">A+</span></button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {([
                                        { key: 'paper' as const, label: 'Papier', bg: '#F5E9D9', text: '#2D2D2D' },
                                        { key: 'light' as const, label: 'Clair', bg: '#FFFFFF', text: '#1A1A1A' },
                                        { key: 'dark' as const, label: 'Sombre', bg: '#1C1917', text: '#E7E5E4' },
                                        { key: 'sepia' as const, label: 'Sepia', bg: '#F4ECD8', text: '#433422' },
                                    ]).map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => onThemeChange(t.key)}
                                            className={cn("p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200", theme === t.key ? "border-primary shadow-md scale-[1.02]" : "border-transparent hover:border-border opacity-70 hover:opacity-100")}
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
    );
}
