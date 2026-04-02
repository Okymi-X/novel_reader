"use client";

import Link from "next/link";
import { useReadingProgress } from "@/presentation/hooks/useReadingProgress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Clock, ChevronRight, Play, TrendingUp, Search as SearchIcon } from "lucide-react";

export default function Home() {
  const { history, isLoading } = useReadingProgress();
  const lastRead = history.length > 0 ? history[0] : null;
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query) {
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
      <div className="flex-1 overflow-y-auto bg-background p-4 md:p-10 flex flex-col items-center justify-center animate-pulse">
        <div className="w-14 h-14 bg-primary/20 rounded-2xl mb-6"></div>
        <div className="h-8 w-48 bg-foreground/10 rounded-full mb-3"></div>
        <div className="h-4 w-64 bg-foreground/5 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 md:p-10 pb-28 md:pb-10 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-1 md:mb-2">{greeting}</h1>
          <p className="text-foreground/60 text-base md:text-lg">Prêt pour le prochain chapitre ?</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative group w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            name="q"
            className="block w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm outline-none text-sm"
            placeholder="Entrer l'URL d'un roman..."
          />
        </form>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

        {/* Continue Reading Card */}
        {lastRead ? (
          <div className="col-span-1 md:col-span-2 md:row-span-2 bg-foreground text-background rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4"></div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 backdrop-blur-md text-[10px] font-bold tracking-wide text-background/80 uppercase">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>Dernière lecture</span>
                </div>
              </div>

              <div className="mt-6 md:mt-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-2 leading-tight line-clamp-2">{lastRead.novelTitle}</h2>
                <p className="text-background/50 text-sm md:text-base mb-6 md:mb-8 line-clamp-1">{lastRead.chapterTitle}</p>

                <Link
                  href={`/read?url=${encodeURIComponent(lastRead.chapterUrl)}`}
                  className="inline-flex items-center gap-3 bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Continuer</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-1 md:col-span-2 bg-foreground text-background rounded-3xl p-6 md:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-background/50" />
              </div>
              <h2 className="text-xl font-serif font-bold mb-2">Commencer</h2>
              <p className="text-background/50 text-sm">Recherchez un roman pour démarrer.</p>
            </div>
          </div>
        )}

        {/* Featured Novel */}
        <Link
          href={`/novel?url=${encodeURIComponent('https://lightnovelfr.com/series/lord-of-the-mysteries/')}`}
          className="bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-border flex flex-col"
        >
          <div className="aspect-[4/3] bg-foreground rounded-xl mb-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, var(--primary) 0%, transparent 60%)' }}></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h4 className="font-serif text-white text-lg md:text-xl text-center leading-tight">Lord of the<br />Mysteries</h4>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-bold text-base text-card-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">Lord of the Mysteries</h3>
            <p className="text-muted-foreground text-xs font-medium">Cuttlefish That Loves Diving</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-primary text-xs font-bold">
            <span>Voir</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Stats Card */}
        <div className="bg-primary rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <TrendingUp className="w-6 h-6 opacity-70 relative z-10" />
          <div className="relative z-10 mt-4">
            <h3 className="font-bold text-4xl mb-1 tracking-tight">{history.length}</h3>
            <p className="text-white/70 font-medium text-xs uppercase tracking-wide">Chapitres Lus</p>
          </div>
        </div>

        {/* Tags Card */}
        <div className="md:col-span-1 bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-serif font-bold text-base mb-3 text-card-foreground">Tendances</h3>
          <div className="flex flex-wrap gap-2">
            {['Fantastique', 'Système', 'Réincarnation'].map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-background text-foreground/70 rounded-lg text-xs font-bold hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-card rounded-2xl p-5 border border-dashed border-border flex items-center justify-center">
          <span className="text-muted-foreground text-sm font-medium">Bientôt disponible</span>
        </div>
      </div>
    </div>
  );
}
