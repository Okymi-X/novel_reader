"use client";

import { useAppSettings } from "@/contexts/SettingsContext";
import { Settings2, Type, MonitorSmartphone, Volume2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { settings, updateSettings, isLoading } = useAppSettings();

    if (isLoading) return null;

    const themes = [
        { id: 'paper', name: 'Original (Paper)', color: 'bg-[#F5E9D9]' },
        { id: 'light', name: 'Clair', color: 'bg-white' },
        { id: 'dark', name: 'Sombre', color: 'bg-[#0C0A09]' },
        { id: 'sepia', name: 'Sepia', color: 'bg-[#F4ECD8]' },
    ] as const;

    const speeds = [0.75, 1, 1.25, 1.5, 2];

    return (
        <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10 animate-fade-in text-foreground">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Paramètres</h1>
                <p className="text-foreground/60 text-lg">Personnalisez votre expérience de lecture.</p>
            </header>

            <div className="max-w-5xl mx-auto">
                {/* Theme Settings - Full Width for visual anchor */}
                <section className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-500 group-hover:scale-110"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="md:w-1/3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-primary/10 rounded-2xl shadow-sm">
                                    <MonitorSmartphone className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-foreground">Thème</h2>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Choisissez l'ambiance visuelle qui correspond le mieux à votre environnement de lecture actuel.
                            </p>
                        </div>

                        <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => updateSettings({ theme: t.id })}
                                    className={`flex flex-col items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${settings.theme === t.id
                                        ? 'border-primary shadow-lg shadow-primary/10 bg-accent/30 scale-105'
                                        : 'border-border/50 hover:border-foreground/20 hover:bg-muted/50'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-full shadow-inner ${t.color} border border-black/10 ring-4 ring-background/50`} />
                                    <span className={`text-sm font-bold tracking-wide ${settings.theme === t.id ? 'text-primary' : 'text-foreground/70'}`}>
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Symmetrical Grid for Typo and Audio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Typography Settings */}
                    <section className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden group flex flex-col h-full">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 transition-transform duration-500 group-hover:scale-150"></div>

                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <div className="p-2.5 bg-purple-500/10 rounded-2xl shadow-sm">
                                <Type className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-foreground">Typographie</h2>
                                <p className="text-sm text-muted-foreground">Confort visuel optimal.</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col justify-center relative z-10">
                            {/* Font Family Selection */}
                            <div className="bg-background/50 p-6 rounded-3xl border border-border/50">
                                <label className="block text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4">Style de Police</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => updateSettings({ fontFamily: 'sans' })}
                                        className={`py-3 rounded-xl border-2 transition-all duration-300 font-sans ${settings.fontFamily === 'sans'
                                            ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-sm'
                                            : 'border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/50'
                                            }`}
                                    >
                                        Moderne (Sans)
                                    </button>
                                    <button
                                        onClick={() => updateSettings({ fontFamily: 'serif' })}
                                        className={`py-3 rounded-xl border-2 transition-all duration-300 font-serif ${settings.fontFamily === 'serif'
                                            ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-sm'
                                            : 'border-border/50 hover:border-foreground/20 text-foreground/70 bg-muted/50'
                                            }`}
                                    >
                                        Classique (Serif)
                                    </button>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="bg-background/50 p-6 rounded-3xl border border-border/50">
                                <div className="flex items-end justify-between mb-4">
                                    <label className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Taille du texte</label>
                                    <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg text-lg font-bold">
                                        {settings.fontSize}px
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min="14" max="32" step="1"
                                    value={settings.fontSize}
                                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/50 
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md transition-all"
                                />

                                <div className="flex justify-between items-center text-muted-foreground mt-4 font-serif">
                                    <span className="text-sm font-medium hover:text-foreground cursor-pointer" onClick={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}>a</span>
                                    <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                                    <span className="text-2xl font-medium hover:text-foreground cursor-pointer" onClick={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 1) })}>A</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Audio Settings */}
                    <section className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden group flex flex-col h-full">
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl translate-y-1/2 translate-x-1/2 transition-transform duration-500 group-hover:scale-150"></div>

                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <div className="p-2.5 bg-blue-500/10 rounded-2xl shadow-sm">
                                <Volume2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-foreground">Lecture Audio</h2>
                                <p className="text-sm text-muted-foreground">Vitesse et intonation de la voix.</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col justify-center relative z-10">
                            {/* Rate */}
                            <div className="bg-background/50 p-5 rounded-3xl border border-border/50">
                                <label className="block text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4">Vitesse par défaut</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {speeds.map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => updateSettings({ rate: speed })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${settings.rate === speed
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105'
                                                : 'bg-muted hover:bg-muted/80 text-foreground/70 border border-border/50 hover:border-border'
                                                }`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pitch */}
                            <div className="bg-background/50 p-5 rounded-3xl border border-border/50">
                                <div className="flex items-end justify-between mb-4">
                                    <label className="text-sm font-bold text-foreground/80 uppercase tracking-wider">Tonalité (Pitch)</label>
                                    <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-bold font-mono">
                                        {settings.pitch.toFixed(1)}
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0.5" max="2" step="0.1"
                                    value={settings.pitch}
                                    onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
                                    className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/50
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md transition-all"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
