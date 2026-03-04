"use client";

import { BookOpen, Home, Library, Settings, Search, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-foreground text-background rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Sidebar (Always rendered, hidden on mobile via CSS) */}
            <aside className="hidden md:flex w-20 md:w-72 border-r border-border bg-foreground fixed left-0 top-0 bottom-0 flex-col items-center md:items-start py-8 md:px-6 gap-8 z-20 text-background">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer (Rendered conditionally based on state) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />

                        {/* Mobile Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-[80vw] max-w-sm bg-foreground z-50 shadow-2xl flex flex-col p-6 gap-8 text-background"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 text-background">
                                    <BookOpen className="w-8 h-8" />
                                    <span className="text-2xl font-serif font-bold">Litverse</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-background/10 transition-colors">
                                    <X className="w-6 h-6 text-background/70" />
                                </button>
                            </div>
                            <SidebarContent mobile onClose={() => setIsOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Barre latérale persistante de bureau (Un peu hacky de partager la logique, simplification pour l'instant : rendus séparés bureau/mobile) */}
            {/* En fait, rendons la version de bureau 'toujours visible' via CSS et la version mobile 'fixe'.
          Meilleure approche :
          1. Barre latérale standard par défaut masquée sur mobile.
          2. Tiroir mobile indépendant.
      */}
        </>
    );
}

// Contenu extrait pour réutilisation
function SidebarContent({ mobile, onClose }: { mobile?: boolean, onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get("q") as string;
        if (query) {
            router.push(`/novel?url=${encodeURIComponent(query)}`);
            if (onClose) onClose();
        }
    };

    return (
        <>
            {!mobile && (
                <Link href="/" className="flex items-center gap-3 text-background px-2 mb-6 hover:opacity-80 transition-opacity w-full">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-2xl font-serif font-medium tracking-tight hidden md:block">Litverse</span>
                </Link>
            )}

            <form onSubmit={handleSearch} className="w-full px-2 relative mb-2 hidden md:block">
                <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-background/40" />
                <input
                    type="text"
                    name="q"
                    placeholder="URL du roman..."
                    className="w-full bg-background/5 border border-background/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-background/90 outline-none focus:ring-2 focus:border-primary/50 focus:bg-background/10 transition-all placeholder:text-background/30"
                />
            </form>

            <nav className="flex flex-col gap-1.5 w-full flex-1 mt-4">
                <div className="px-3 mb-1">
                    <p className="text-[10px] font-bold text-background/40 uppercase tracking-widest hidden md:block">Menu Principal</p>
                </div>
                <NavItem icon={<Home className="w-5 h-5" />} label="Accueil" href="/" active={pathname === '/'} onClick={onClose} />
                <NavItem icon={<Library className="w-5 h-5" />} label="Bibliothèque" href="/library" active={pathname.startsWith('/library')} onClick={onClose} />

                <div className="px-3 mt-8 mb-1">
                    <p className="text-[10px] font-bold text-background/40 uppercase tracking-widest hidden md:block">Préférences</p>
                </div>
                <NavItem icon={<Settings className="w-5 h-5" />} label="Paramètres" href="/settings" active={pathname.startsWith('/settings')} onClick={onClose} />
            </nav>

            {!mobile && (
                <div className="mt-auto w-full px-2 hidden md:block pb-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/60 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20 group cursor-pointer transition-transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="font-bold relative z-10 mb-1 text-sm">Pass. Audio Pro</h4>
                        <p className="text-xs text-primary-foreground/90 relative z-10 mb-4 leading-relaxed">Débloquez l'audio IA illimité et de nouvelles voix.</p>
                        <button className="w-full py-2.5 bg-background/20 hover:bg-background text-white hover:text-foreground rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm backdrop-blur-sm">
                            Découvrir
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

function NavItem({ icon, label, href, active = false, onClick }: { icon: React.ReactNode; label: string; href: string; active?: boolean, onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden ${active
                ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary shadow-sm border border-primary/20'
                : 'text-background/50 hover:bg-background/5 hover:text-background border border-transparent'
                }`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]"></div>}
            <span className={active ? "text-primary scale-110 transition-transform" : "text-background/40 group-hover:text-background group-hover:scale-110 transition-all"}>{icon}</span>
            <span className="hidden md:block text-sm">{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-primary/50 hidden md:block" />}
        </Link>
    )
}
