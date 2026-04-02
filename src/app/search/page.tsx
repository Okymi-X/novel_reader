"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, ArrowRight, BookOpen, Sparkles, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

const POPULAR_NOVELS = [
    { title: "Lord of the Mysteries", url: "https://lightnovelfr.com/series/lord-of-the-mysteries/" },
    { title: "Omniscient Reader", url: "https://lightnovelfr.com/series/omniscient-readers-viewpoint/" },
    { title: "Shadow Slave", url: "https://lightnovelfr.com/series/shadow-slave/" },
];

export default function SearchPage() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            router.push(`/novel?url=${encodeURIComponent(url.trim())}`);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-10 pb-28 md:pb-10 animate-fade-in text-foreground">
            
            {/* Hero Section */}
            <div className="max-w-2xl mx-auto pt-8 md:pt-16">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isFocused ? 'bg-primary shadow-lg shadow-primary/30 scale-110' : 'bg-primary/10'
                    }`}>
                        <SearchIcon className={`w-8 h-8 transition-colors ${isFocused ? 'text-white' : 'text-primary'}`} />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Trouver un Roman</h1>
                    <p className="text-foreground/60 text-sm md:text-base max-w-md mx-auto">
                        Collez l'URL d'un roman pour commencer la lecture avec synthèse vocale.
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-10">
                    <div className={`relative rounded-2xl transition-all duration-300 ${
                        isFocused ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/10' : ''
                    }`}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-5">
                            <BookOpen className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-foreground/30'}`} />
                        </div>
                        <input
                            type="url"
                            placeholder="https://lightnovelfr.com/series/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full bg-card border border-border rounded-2xl py-4 pl-14 pr-14 text-base font-medium outline-none transition-all placeholder:text-foreground/30"
                            required
                        />
                        <button
                            type="submit"
                            className="absolute inset-y-2 right-2 flex items-center justify-center w-10 h-10 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                {/* Popular Novels */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Populaires</span>
                    </div>
                    <div className="space-y-2">
                        {POPULAR_NOVELS.map((novel) => (
                            <Link
                                key={novel.url}
                                href={`/novel?url=${encodeURIComponent(novel.url)}`}
                                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-foreground/40" />
                                    </div>
                                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{novel.title}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Supported Sites */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Sites Supportés</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['lightnovelfr.com', 'wuxiaworld.eu', 'boxnovel.com'].map((site) => (
                            <span 
                                key={site}
                                className="px-3 py-1.5 bg-background text-foreground/70 rounded-lg text-sm font-medium border border-border"
                            >
                                {site}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
