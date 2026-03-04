"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, ArrowRight, BookOpen } from "lucide-react";

export default function SearchPage() {
    const router = useRouter();
    const [url, setUrl] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            router.push(`/novel?url=${encodeURIComponent(url.trim())}`);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10 pb-28 md:pb-10 flex flex-col items-center justify-center animate-fade-in text-foreground min-h-[80vh]">
            <div className="w-full max-w-xl flex flex-col items-center gap-8">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                    <SearchIcon className="w-10 h-10" />
                </div>

                <div className="text-center mb-4">
                    <h1 className="text-4xl font-serif font-bold mb-3">Rechercher</h1>
                    <p className="text-foreground/60 font-medium max-w-sm mx-auto">Collez l'URL d'un roman texte provenant d'un de nos sites supportés pour démarrer l'écoute.</p>
                </div>

                <form onSubmit={handleSearch} className="w-full relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-6">
                        <BookOpen className="w-6 h-6 text-foreground/30 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="url"
                        placeholder="https://lightnovelfr.com/series/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-foreground/5 border-2 border-transparent focus:border-primary/50 rounded-2xl py-5 pl-16 pr-16 text-lg font-medium outline-none transition-all shadow-sm focus:bg-foreground/5"
                        required
                    />
                    <button
                        type="submit"
                        className="absolute inset-y-2 right-2 flex items-center justify-center w-12 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </form>

                <div className="mt-8 flex flex-wrap max-w-md justify-center gap-2">
                    <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest w-full text-center mb-2">Sites Supportés</span>
                    <span className="px-3 py-1.5 bg-foreground/5 text-foreground/60 rounded-lg text-sm font-medium">lightnovelfr.com</span>
                    <span className="px-3 py-1.5 bg-foreground/5 text-foreground/60 rounded-lg text-sm font-medium">wuxiaworld.eu</span>
                    <span className="px-3 py-1.5 bg-foreground/5 text-foreground/60 rounded-lg text-sm font-medium">boxnovel.com</span>
                </div>
            </div>
        </div>
    );
}
