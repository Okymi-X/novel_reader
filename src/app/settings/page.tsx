"use client";

import { useAppSettings } from "@/presentation/state/SettingsContext";
import { Settings2, Type, Palette, Volume2, Sparkles } from "lucide-react";

export default function SettingsPage() {
    const { settings, updateSettings, isLoading } = useAppSettings();

    if (isLoading) return null;

    const themes = [
        { id: 'paper', name: 'Paper', color: 'bg-[#F5E9D9]' },
        { id: 'light', name: 'Clair', color: 'bg-white' },
        { id: 'dark', name: 'Sombre', color: 'bg-[#0C0A09]' },
        { id: 'sepia', name: 'Sepia', color: 'bg-[#F4ECD8]' },
    ] as const;

    const speeds = [0.75, 1, 1.25, 1.5, 2];

    return (
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-10 pb-28 md:pb-10 animate-fade-in text-foreground">
            {/* Header */}
            <header className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2">Paramètres</h1>
                <p className="text-foreground/60 text-base md:text-lg">Personnalisez votre expérience de lecture.</p>
            </header>

            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Theme Section */}
                <section className="bg-card rounded-3xl border border-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Palette className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-foreground">Thème</h2>
                            <p className="text-sm text-muted-foreground">Choisissez votre ambiance</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => updateSettings({ theme: t.id })}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${settings.theme === t.id
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full ${t.color} border border-border shadow-inner`} />
                                <span className={`text-sm font-semibold ${settings.theme === t.id ? 'text-primary' : 'text-foreground/70'}`}>
                                    {t.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Typography & Audio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Typography */}
                    <section className="bg-card rounded-3xl border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Type className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-foreground">Typographie</h2>
                                <p className="text-sm text-muted-foreground">Confort de lecture</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Font Family */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Police</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => updateSettings({ fontFamily: 'sans' })}
                                        className={`py-3 px-4 rounded-xl border-2 text-sm font-sans font-medium transition-all ${settings.fontFamily === 'sans'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border/50 hover:border-primary/30 text-foreground/70'
                                        }`}
                                    >
                                        Sans-Serif
                                    </button>
                                    <button
                                        onClick={() => updateSettings({ fontFamily: 'serif' })}
                                        className={`py-3 px-4 rounded-xl border-2 text-sm font-serif font-medium transition-all ${settings.fontFamily === 'serif'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border/50 hover:border-primary/30 text-foreground/70'
                                        }`}
                                    >
                                        Serif
                                    </button>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Taille</label>
                                    <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                        {settings.fontSize}px
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="14" max="32" step="1"
                                    value={settings.fontSize}
                                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                                />
                                <div className="flex justify-between text-muted-foreground mt-2 font-serif">
                                    <span className="text-xs">Aa</span>
                                    <span className="text-lg">Aa</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Audio */}
                    <section className="bg-card rounded-3xl border border-border p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-foreground">Audio</h2>
                                <p className="text-sm text-muted-foreground">Lecture vocale</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Speed */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Vitesse</label>
                                <div className="flex gap-2">
                                    {speeds.map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => updateSettings({ rate: speed })}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${settings.rate === speed
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'bg-muted hover:bg-muted/80 text-foreground/70 border border-border/50'
                                            }`}
                                        >
                                            {speed}×
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pitch */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tonalité</label>
                                    <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg font-mono">
                                        {settings.pitch.toFixed(1)}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5" max="2" step="0.1"
                                    value={settings.pitch}
                                    onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* TTS Provider Selection */}
                <section className="bg-card rounded-3xl border border-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-foreground">Moteur vocal</h2>
                            <p className="text-sm text-muted-foreground">Choisissez votre voix de narration</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Browser TTS */}
                        <button
                            onClick={() => updateSettings({ ttsProvider: 'browser' })}
                            className={`flex flex-col gap-2 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${settings.ttsProvider === 'browser'
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                            }`}
                        >
                            <h3 className={`font-serif font-bold ${settings.ttsProvider === 'browser' ? 'text-primary' : 'text-foreground'}`}>Système</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Voix intégrées à votre appareil. Rapide et fonctionne hors-ligne.
                            </p>
                        </button>

                        {/* Kokoro TTS */}
                        <button
                            onClick={() => updateSettings({ ttsProvider: 'kokoro' })}
                            className={`flex flex-col gap-2 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${settings.ttsProvider === 'kokoro'
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                            }`}
                        >
                            <h3 className={`font-serif font-bold ${settings.ttsProvider === 'kokoro' ? 'text-primary' : 'text-foreground'}`}>Kokoro AI</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Voix IA gratuites et naturelles. Idéal pour de longues sessions de lecture.
                            </p>
                        </button>

                        {/* ElevenLabs TTS */}
                        <button
                            onClick={() => updateSettings({ ttsProvider: 'elevenlabs' })}
                            className={`flex flex-col gap-2 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${settings.ttsProvider === 'elevenlabs'
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                            }`}
                        >
                            <h3 className={`font-serif font-bold ${settings.ttsProvider === 'elevenlabs' ? 'text-primary' : 'text-foreground'}`}>ElevenLabs</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Voix ultra-réalistes premium. Nécessite une configuration web.
                            </p>
                        </button>
                    </div>
                </section>

                {/* TTS Provider Info */}
                <section className="bg-foreground text-background rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-xl mb-1 text-background">
                                    Moteur sélectionné : {settings.ttsProvider === 'elevenlabs' ? 'ElevenLabs' : settings.ttsProvider === 'kokoro' ? 'Kokoro AI' : 'Système'}
                                </h3>
                                <p className="text-background/70 text-sm leading-relaxed">
                                    {settings.ttsProvider === 'elevenlabs' 
                                        ? "Voix IA premium disponible dans le lecteur. Configurez vos préférences ElevenLabs depuis les contrôles audio pendant la lecture."
                                        : settings.ttsProvider === 'kokoro'
                                        ? 'Voix IA libres de haute qualité. Les temps de réponse peuvent varier selon la charge des serveurs Hugging Face.'
                                        : 'Les voix varient selon votre système d\'exploitation (Windows, macOS, iOS, Android).'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                            <span className="inline-flex flex-col md:items-end gap-1">
                                <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/20 px-3 py-1.5 rounded-full">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                    {settings.ttsProvider === 'browser' ? 'Actif hors-ligne' : 'Connecté via le lecteur'}
                                </span>
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
