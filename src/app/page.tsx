"use client";

import Link from "next/link";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Sparkles, ChevronRight, Play, Star, TrendingUp, Grid, List, Search as SearchIcon } from "lucide-react";

export default function Home() {
  const { history, isLoading } = useReadingProgress();
  console.log("HOME: History received:", history, "isLoading:", isLoading);

  const lastRead = history.length > 0 ? history[0] : null;
  console.log("HOME: lastRead item:", lastRead);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query) {
      // If it's a URL we go there, else we can build a basic query or just pass the url
      router.push(`/novel?url=${encodeURIComponent(query)}`);
    }
  };

  const [greeting, setGreeting] = useState("Bonjour");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) setGreeting("Bonsoir");
    else setGreeting("Bonjour");
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl mb-6"></div>
        <div className="h-8 w-48 bg-foreground/10 rounded-full mb-3"></div>
        <div className="h-4 w-64 bg-foreground/5 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-10 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">{greeting}, Alex</h1>
          <p className="text-foreground/60 text-lg">Prêt pour le prochain chapitre ?</p>
        </div>

        {/* Search Bar - stylized */}
        <form onSubmit={handleSearch} className="relative group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            name="q"
            className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-card border-none text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all shadow-sm hover:shadow-md outline-none"
            placeholder="Rechercher un roman (Entrez l'URL)..."
          />
        </form>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">

        {/* Main Continue Reading Card - Spans 2 cols, 2 rows */}
        {lastRead ? (
          <div className="col-span-1 md:col-span-2 row-span-2 bg-foreground text-background rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 backdrop-blur-md border border-background/10 text-xs font-medium tracking-wide text-background/90">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>DERNIÈRE LECTURE</span>
                </div>
                <button className="w-12 h-12 rounded-full border border-background/10 flex items-center justify-center hover:bg-background text-background hover:text-foreground transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-8">
                <h2 className="text-3xl md:text-4xl font-serif font-medium mb-3 leading-snug">{lastRead.novelTitle}</h2>
                <p className="text-background/50 text-lg mb-8">{lastRead.chapterTitle}</p>

                <Link
                  href={`/read?url=${encodeURIComponent(lastRead.chapterUrl)}`}
                  className="inline-flex items-center gap-4 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold tracking-wide hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>CONTINUE</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-1 md:col-span-2 row-span-1 bg-foreground text-background rounded-[2.5rem] p-8 relative overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-serif mb-2">Commencer la lecture</h2>
              <p className="text-background/60">Sélectionnez un roman pour commencer.</p>
            </div>
          </div>
        )}

        {/* Featured Novel Card 1 */}
        <Link
          href={`/novel?url=${encodeURIComponent('https://lightnovelfr.com/series/lord-of-the-mysteries/')}`}
          className="md:col-span-1 bg-card rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full border border-border"
        >
          <div className="aspect-[3/4] bg-muted rounded-2xl mb-4 relative overflow-hidden shadow-inner group-hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-foreground/90"></div>
            {/* Abstract Cover Art */}
            <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at 50% 120%, var(--primary) 0%, transparent 60%)' }}></div>
            <div className="absolute top-4 left-4 right-4 text-center">
              <span className="text-[10px] tracking-[0.2em] text-white/60 uppercase font-sans">Classique</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h4 className="font-serif text-white text-2xl text-center leading-tight">Lord of the<br />Mysteries</h4>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-card-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">Lord of the Mysteries</h3>
            <p className="text-muted-foreground text-sm font-medium">Cuttlefish</p>
          </div>
          <div className="mt-auto pt-4 flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider">
            <span>Lire maintenant</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Stats / Info Card */}
        <div className="bg-primary rounded-[2rem] p-6 text-primary-foreground flex flex-col justify-between shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <TrendingUp className="w-8 h-8 opacity-80 relative z-10" />
          <div className="relative z-10">
            <h3 className="font-bold text-5xl mb-1 tracking-tighter">12</h3>
            <p className="text-primary-foreground/80 font-medium text-sm uppercase tracking-wide">Chapitres Lus</p>
          </div>
        </div>

        {/* Categories / Tags */}
        <div className="md:col-span-1 bg-card rounded-[2rem] p-6 border border-border flex flex-col">
          <h3 className="font-serif font-bold text-lg mb-4 text-card-foreground">Tendances</h3>
          <div className="flex flex-wrap gap-2 content-start">
            {['Fantastique', 'Système', 'Réincarnation'].map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-background text-foreground/70 rounded-lg text-xs font-bold hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
            {['Magie', 'Aventure', 'Mystère'].map(tag => (
              <span key={tag} className="px-3 py-1.5 border border-border text-foreground/70 rounded-lg text-xs font-bold hover:border-foreground hover:text-foreground transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* More Novel Placeholders */}
        <div className="bg-card rounded-[2rem] p-6 border border-border flex items-center justify-center text-muted-foreground font-medium border-dashed">
          <span>Bientôt disponible</span>
        </div>

      </div>
    </div>
  );
}
