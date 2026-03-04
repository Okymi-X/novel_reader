"use client";

import { useEffect, useState, Suspense } from 'react';
import { NovelInfo } from '@/types';
import Link from 'next/link';
import { Loader2, BookOpen, Calendar, ChevronRight, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useSavedNovels } from '@/presentation/state/SavedNovelsContext';
import { useToast } from '@/presentation/state/ToastContext';

function NovelDetailsContent() {
    const searchParams = useSearchParams();
    // Default to LOTM if no URL provided (as per current scope)
    const url = searchParams.get('url') || 'https://lightnovelfr.com/series/lord-of-the-mysteries/';

    const [novel, setNovel] = useState<NovelInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addNovel, removeNovel, isSaved } = useSavedNovels();
    const saved = isSaved(url);
    const { addToast } = useToast();

    const handleToggleSave = () => {
        if (!novel) return;
        if (saved) {
            removeNovel(url);
            addToast("Retiré de la collection", "info");
        } else {
            addNovel({
                url: url,
                title: novel.title,
                cover: novel.cover || "",
                author: novel.author || "",
            });
            addToast("Ajouté à la collection !", "success");
        }
    };

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await fetch(`/api/novel/info?url=${encodeURIComponent(url)}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to load novel info');
                const data = await res.json();
                setNovel(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load novel information.");
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [url]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-primary gap-4 bg-background">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="font-serif italic text-foreground/60">Summoning the grimoire...</p>
            </div>
        );
    }

    if (error || !novel) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500 gap-4 p-8 text-center bg-background">
                <p>{error || "Novel not found"}</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-background scrollbar-hide">
            {/* Immersive Hero Section */}
            <div className="relative bg-foreground w-full border-b border-border/10">
                {/* Background Art */}
                <div className="absolute inset-0 opacity-40 md:opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #FF6B35 0%, transparent 70%)' }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                {/* Gradient to smooth out the bottom transition */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background"></div>

                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-24 pb-12 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">

                    {/* Cover Art */}
                    <div className="w-40 sm:w-48 md:w-60 shrink-0 rounded-2xl shadow-2xl overflow-hidden border-4 border-background/20 bg-stone-900 group">
                        {novel.cover ? (
                            <img src={novel.cover} alt={novel.title} className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full aspect-[2/3] flex items-center justify-center text-white/20">
                                <BookOpen className="w-16 h-16" />
                            </div>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full pt-2 md:pt-0">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                {novel.status || "En cours"}
                            </span>
                            <span className="px-3 py-1 bg-foreground/5 backdrop-blur-md text-foreground/80 border border-foreground/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Fantastique
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-3 md:mb-5 text-foreground leading-[1.1]">{novel.title}</h1>

                        <p className="text-foreground/70 text-base md:text-lg font-medium flex items-center gap-2 mb-8 md:mb-10">
                            <span className="opacity-60">Par</span>
                            <span className="font-bold border-b-2 border-primary/30 pb-0.5">{novel.author || "Inconnu"}</span>
                        </p>

                        <button
                            onClick={handleToggleSave}
                            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto text-sm md:text-base ${saved
                                ? 'bg-foreground text-background hover:bg-foreground/90 shadow-lg'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 hover:-translate-y-0.5'
                                }`}
                        >
                            {saved ? <BookmarkCheck className="w-5 h-5 md:w-6 md:h-6" /> : <BookmarkPlus className="w-5 h-5 md:w-6 md:h-6" />}
                            <span>{saved ? 'Dans la bibliothèque' : 'Ajouter à la bibliothèque'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-32">

                {/* Stats Grid - Bento Style */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    <div className="md:col-span-3 bg-white rounded-[2rem] p-8 shadow-sm border border-border">
                        <h3 className="font-serif font-bold text-2xl mb-4 text-foreground">Synopsis</h3>
                        <p className="text-foreground/70 leading-relaxed text-lg">
                            Le monde change. La vapeur et les machines remodèlent la société, tandis que d'anciens mystères s'agitent dans l'ombre.
                            Suivez Klein Moretti alors qu'il navigue dans un monde victorien rempli d'horreurs eldritch, d'intrigues politiques et de la voie pour devenir un Beyonder.
                            (Description temporaire le temps que le scraper récupère le synopsis complet).
                        </p>
                    </div>
                    <div className="bg-foreground rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div>
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-1">Chapitres</p>
                            <p className="text-5xl font-serif font-bold">{novel.volumes.reduce((acc, vol) => acc + vol.chapters.length, 0)}</p>
                        </div>
                        <div className="mt-8">
                            <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-1">Note</p>
                            <div className="flex gap-1 text-primary">
                                {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chapter List Section */}
                <ChapterList volumes={novel.volumes} />
            </div>
        </div>
    );
}

function ChapterList({ volumes }: { volumes: { title: string, chapters: { title: string, url: string, date?: string }[] }[] }) {
    // Flatten chapters for easier pagination handles
    const allChapters = volumes.reduce((acc, vol) => {
        return [...acc, ...vol.chapters.map(c => ({ ...c, volumeTitle: vol.title }))];
    }, [] as Array<{ title: string, url: string, date?: string, volumeTitle: string }>);

    const [selectedRange, setSelectedRange] = useState(0);
    const CHUNK_SIZE = 100;

    const ranges = [];
    for (let i = 0; i < allChapters.length; i += CHUNK_SIZE) {
        ranges.push({
            start: i,
            end: Math.min(i + CHUNK_SIZE, allChapters.length),
            label: `${i + 1}-${Math.min(i + CHUNK_SIZE, allChapters.length)}`
        });
    }

    const currentChapters = allChapters.slice(selectedRange * CHUNK_SIZE, (selectedRange + 1) * CHUNK_SIZE);

    return (
        <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-1">Liste des Chapitres</h2>
                    <p className="text-foreground/40 font-medium">Total: {allChapters.length} Chapitres</p>
                </div>

                {/* Range Selector */}
                {ranges.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 max-w-full scrollbar-thin">
                        {ranges.map((range, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedRange(idx)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedRange === idx
                                    ? 'bg-foreground text-white shadow-lg'
                                    : 'bg-background text-foreground/60 hover:bg-primary/10 hover:text-primary'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {currentChapters.map((chapter, index) => {
                    // Add global index for display
                    const globalIndex = selectedRange * CHUNK_SIZE + index + 1;

                    return (
                        <Link
                            key={index}
                            href={`/read?url=${encodeURIComponent(chapter.url)}`}
                            className="group flex items-center justify-between p-4 rounded-xl hover:bg-background/50 border border-transparent hover:border-border transition-all duration-200"
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <span className="w-12 text-sm font-mono text-foreground/30 font-bold">#{globalIndex}</span>
                                <div className="flex flex-col">
                                    <span className="font-medium text-[15px] text-foreground group-hover:text-primary transition-colors truncate pr-4">
                                        {chapter.title}
                                    </span>
                                    {chapter.date && (
                                        <span className="text-xs text-foreground/40 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3 h-3" /> {chapter.date}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function NovelPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <NovelDetailsContent />
        </Suspense>
    )
}
