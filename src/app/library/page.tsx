"use client";

import Link from "next/link";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useSavedNovels } from "@/contexts/SavedNovelsContext";
import { BookOpen, Clock, ChevronRight, Play, Bookmark, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
    const { history, isLoading: historyLoading } = useReadingProgress();
    const { savedNovels, removeNovel, isLoading: savedLoading } = useSavedNovels();
    const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

    if (historyLoading || savedLoading) {
        return (
            <div className="flex-1 bg-background p-6 md:p-10 flex flex-col items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl mb-6"></div>
                <div className="h-8 w-48 bg-foreground/10 rounded-full mb-3"></div>
                <div className="h-4 w-64 bg-foreground/5 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10 animate-fade-in flex flex-col">
            <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">Ma Bibliothèque</h1>
                <p className="text-foreground/60 text-lg">Gérez vos lectures en cours et votre collection.</p>
            </header>

            {/* Custom Tabs */}
            <div className="flex bg-foreground/5 p-1 rounded-2xl w-fit mb-8 shadow-inner border border-foreground/5">
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                        activeTab === 'history' ? "bg-background text-foreground shadow-sm" : "text-foreground/50 hover:text-foreground"
                    )}
                >
                    <Clock className="w-4 h-4" />
                    En cours ({history.length})
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                        activeTab === 'saved' ? "bg-background text-foreground shadow-sm" : "text-foreground/50 hover:text-foreground"
                    )}
                >
                    <Bookmark className="w-4 h-4" />
                    Ma Collection ({savedNovels.length})
                </button>
            </div>

            {activeTab === 'history' && (
                <div className="animate-fade-in">
                    {history.length === 0 ? (
                        <EmptyState
                            icon={<Clock className="w-16 h-16 text-muted-foreground mb-4" />}
                            title="Aucune lecture en cours"
                            desc="Commencez à lire un roman et il apparaîtra ici."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {history.map((item, index) => {
                                const date = new Date(item.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                                return (
                                    <div key={index} className="bg-card rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-border relative overflow-hidden">
                                        <div className="flex items-start justify-between mb-6 relative z-10">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-[10px] font-bold tracking-wide text-foreground/70 uppercase">
                                                <Clock className="w-3 h-3 text-primary" />
                                                <span>{date}</span>
                                            </div>
                                        </div>
                                        <div className="relative z-10 flex-1 flex flex-col">
                                            <Link href={`/novel?url=${encodeURIComponent(item.novelUrl)}`} className="group/title">
                                                <h3 className="font-serif font-bold text-xl text-card-foreground mb-2 group-hover/title:text-primary transition-colors line-clamp-2">
                                                    {item.novelTitle}
                                                </h3>
                                            </Link>
                                            <p className="text-muted-foreground text-sm font-medium mb-6 line-clamp-1">{item.chapterTitle}</p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <Link
                                                    href={`/read?url=${encodeURIComponent(item.chapterUrl)}`}
                                                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-xs tracking-wide hover:bg-primary hover:text-primary-foreground shadow-sm group/btn transition-all"
                                                >
                                                    <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
                                                    <span>Continuer</span>
                                                </Link>
                                                <Link href={`/novel?url=${encodeURIComponent(item.novelUrl)}`} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background text-foreground transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="animate-fade-in flex-1">
                    {savedNovels.length === 0 ? (
                        <EmptyState
                            icon={<Bookmark className="w-16 h-16 text-muted-foreground mb-4" />}
                            title="Collection vide"
                            desc="Ajoutez des romans depuis la page de détails pour les retrouver ici."
                        />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {savedNovels.map((novel, index) => (
                                <div key={index} className="group flex flex-col gap-3">
                                    <div className="aspect-[2/3] w-full bg-card rounded-2xl overflow-hidden relative shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 border border-border">
                                        {/* Cover Background */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center blur-lg opacity-40 scale-110"
                                            style={{ backgroundImage: novel.cover ? `url(${novel.cover})` : 'none' }}
                                        />

                                        {novel.cover ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={novel.cover} alt={novel.title} className="absolute inset-0 w-full h-full object-cover relative z-10" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-foreground relative z-10">
                                                <h4 className="font-serif text-background text-xl text-center leading-tight line-clamp-3">{novel.title}</h4>
                                            </div>
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 gap-3 backdrop-blur-sm">
                                            <Link
                                                href={`/novel?url=${encodeURIComponent(novel.url)}`}
                                                className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl text-sm shadow-lg hover:scale-105 transition-transform"
                                            >
                                                Ouvrir
                                            </Link>
                                            <button
                                                onClick={(e) => { e.preventDefault(); removeNovel(novel.url); }}
                                                className="bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-destructive/80 transition-colors"
                                            >
                                                Retirer
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => window.location.href = `/novel?url=${encodeURIComponent(novel.url)}`}>
                                            {novel.title}
                                        </h3>
                                        {novel.author && <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-medium">{novel.author}</p>}
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
        <div className="bg-card text-card-foreground rounded-[2.5rem] p-12 text-center border border-border shadow-sm flex flex-col items-center max-w-2xl mx-auto mt-10">
            {icon}
            <h2 className="text-2xl font-serif font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-8">{desc}</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Découvrir des romans
            </Link>
        </div>
    );
}
