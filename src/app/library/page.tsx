"use client";

import Link from "next/link";
import { useReadingProgress } from "@/presentation/hooks/useReadingProgress";
import { useSavedNovels } from "@/presentation/state/SavedNovelsContext";
import { BookOpen, Clock, ChevronRight, Play, Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
    const { history, isLoading: historyLoading } = useReadingProgress();
    const { savedNovels, removeNovel, isLoading: savedLoading } = useSavedNovels();
    const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

    if (historyLoading || savedLoading) {
        return (
            <div className="flex-1 bg-background p-4 md:p-10 flex flex-col items-center justify-center animate-pulse">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl mb-6"></div>
                <div className="h-8 w-48 bg-foreground/10 rounded-full mb-3"></div>
                <div className="h-4 w-64 bg-foreground/5 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-10 pb-28 md:pb-10 animate-fade-in flex flex-col">
            {/* Header */}
            <header className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-1 md:mb-2">Ma Bibliothèque</h1>
                <p className="text-foreground/60 text-sm md:text-lg">Gérez vos lectures et votre collection.</p>
            </header>

            {/* Tabs */}
            <div className="flex bg-card p-1 rounded-xl w-fit mb-6 md:mb-8 border border-border">
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg font-bold text-sm transition-all",
                        activeTab === 'history' 
                            ? "bg-foreground text-background shadow-sm" 
                            : "text-foreground/50 hover:text-foreground"
                    )}
                >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">En cours</span>
                    <span className="text-xs opacity-70">({history.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                        "flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg font-bold text-sm transition-all",
                        activeTab === 'saved' 
                            ? "bg-foreground text-background shadow-sm" 
                            : "text-foreground/50 hover:text-foreground"
                    )}
                >
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden sm:inline">Collection</span>
                    <span className="text-xs opacity-70">({savedNovels.length})</span>
                </button>
            </div>

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="animate-fade-in flex-1">
                    {history.length === 0 ? (
                        <EmptyState
                            icon={<Clock className="w-12 h-12 text-muted-foreground" />}
                            title="Aucune lecture"
                            desc="Commencez à lire un roman."
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {history.map((item, index) => {
                                const date = new Date(item.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                                return (
                                    <div key={index} className="bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 group border border-border flex flex-col">
                                        {/* Date Badge */}
                                        <div className="flex items-center gap-1.5 mb-4">
                                            <Clock className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">{date}</span>
                                        </div>

                                        {/* Content */}
                                        <Link href={`/novel?url=${encodeURIComponent(item.novelUrl)}`} className="flex-1">
                                            <h3 className="font-serif font-bold text-lg text-card-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                {item.novelTitle}
                                            </h3>
                                            <p className="text-muted-foreground text-xs font-medium line-clamp-1">{item.chapterTitle}</p>
                                        </Link>

                                        {/* Actions */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <Link
                                                href={`/read?url=${encodeURIComponent(item.chapterUrl)}`}
                                                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary hover:text-white transition-all"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                <span>Continuer</span>
                                            </Link>
                                            <Link 
                                                href={`/novel?url=${encodeURIComponent(item.novelUrl)}`} 
                                                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-foreground hover:text-background text-foreground/50 transition-all"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Saved Tab */}
            {activeTab === 'saved' && (
                <div className="animate-fade-in flex-1">
                    {savedNovels.length === 0 ? (
                        <EmptyState
                            icon={<Bookmark className="w-12 h-12 text-muted-foreground" />}
                            title="Collection vide"
                            desc="Ajoutez des romans à votre collection."
                        />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {savedNovels.map((novel, index) => (
                                <div key={index} className="group flex flex-col gap-2.5">
                                    {/* Cover */}
                                    <div className="aspect-[2/3] w-full bg-card rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-200 border border-border">
                                        {novel.cover ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-foreground p-3">
                                                <h4 className="font-serif text-background text-sm text-center leading-tight line-clamp-3">{novel.title}</h4>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                                            <Link
                                                href={`/novel?url=${encodeURIComponent(novel.url)}`}
                                                className="w-full bg-primary text-white font-bold px-3 py-2 rounded-lg text-xs text-center hover:bg-primary/90 transition-colors"
                                            >
                                                Ouvrir
                                            </Link>
                                            <button
                                                onClick={(e) => { e.preventDefault(); removeNovel(novel.url); }}
                                                className="w-full bg-white/20 text-white font-medium px-3 py-2 rounded-lg text-xs hover:bg-red-500/80 transition-colors"
                                            >
                                                Retirer
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <h3 
                                            className="font-bold text-foreground text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer" 
                                            onClick={() => window.location.href = `/novel?url=${encodeURIComponent(novel.url)}`}
                                        >
                                            {novel.title}
                                        </h3>
                                        {novel.author && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{novel.author}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-card rounded-2xl p-10 md:p-12 text-center border border-border flex flex-col items-center max-w-md mx-auto mt-8">
            <div className="mb-4">{icon}</div>
            <h2 className="text-xl font-serif font-bold mb-2 text-foreground">{title}</h2>
            <p className="text-muted-foreground text-sm mb-6">{desc}</p>
            <Link href="/search" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                Découvrir
            </Link>
        </div>
    );
}
