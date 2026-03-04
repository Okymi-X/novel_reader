"use client";

import { BookOpen, Home, Library, Settings, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Sidebar() {
    return (
        <aside className="hidden md:flex w-72 border-r border-border bg-foreground fixed left-0 top-0 bottom-0 flex-col py-8 px-6 gap-8 z-20 text-background">
            <SidebarContent />
        </aside>
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
        </>
    );
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
    );
}
