"use client";

import { BookOpen, Home, Library, Settings, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
    return (
        <aside className="hidden md:flex w-72 border-r border-border bg-foreground fixed left-0 top-0 bottom-0 flex-col py-6 px-4 z-20 text-background">
            <SidebarContent />
        </aside>
    );
}

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

    const mainNav = [
        { icon: Home, label: "Accueil", href: "/" },
        { icon: Library, label: "Bibliothèque", href: "/library" },
    ];

    const prefNav = [
        { icon: Settings, label: "Paramètres", href: "/settings" },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            {!mobile && (
                <Link href="/" className="flex items-center gap-3 px-3 py-2 mb-6 hover:opacity-90 transition-opacity">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-serif font-bold text-background tracking-tight">Litverse</span>
                </Link>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="px-2 mb-6">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-background/30" />
                    <input
                        type="text"
                        name="q"
                        placeholder="URL du roman..."
                        className="w-full bg-background/5 hover:bg-background/10 focus:bg-background/10 border border-background/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-background/90 outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-background/30"
                    />
                </div>
            </form>

            {/* Main Navigation */}
            <nav className="flex-1 px-2 space-y-1">
                <SectionLabel>Navigation</SectionLabel>
                {mainNav.map(item => (
                    <NavItem 
                        key={item.href}
                        icon={item.icon} 
                        label={item.label} 
                        href={item.href} 
                        active={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)} 
                        onClick={onClose} 
                    />
                ))}

                <div className="pt-6">
                    <SectionLabel>Préférences</SectionLabel>
                    {prefNav.map(item => (
                        <NavItem 
                            key={item.href}
                            icon={item.icon} 
                            label={item.label} 
                            href={item.href} 
                            active={pathname.startsWith(item.href)} 
                            onClick={onClose} 
                        />
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="px-3 pt-4 border-t border-background/10">
                <p className="text-[10px] text-background/30 font-medium">
                    Litverse v1.0 · TTS Reader
                </p>
            </div>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold text-background/30 uppercase tracking-widest px-3 mb-2">
            {children}
        </p>
    );
}

function NavItem({ 
    icon: Icon, 
    label, 
    href, 
    active = false, 
    onClick 
}: { 
    icon: React.ElementType; 
    label: string; 
    href: string; 
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-background/50 hover:bg-background/5 hover:text-background'
            )}
        >
            <Icon className={cn(
                "w-5 h-5 transition-transform",
                active ? "text-white" : "text-background/40 group-hover:text-background"
            )} />
            <span className="text-sm font-medium flex-1">{label}</span>
            {active && <ChevronRight className="w-4 h-4 text-white/60" />}
        </Link>
    );
}
