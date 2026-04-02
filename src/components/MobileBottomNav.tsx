"use client";

import { Home, Library, Settings, Search, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
    const pathname = usePathname();

    // Do not show bottom nav on the reading page to keep it immersive
    if (pathname.startsWith('/read')) {
        return null;
    }

    const navItems = [
        { icon: Home, label: "Accueil", href: "/" },
        { icon: Search, label: "Roman", href: "/search" },
        { icon: Library, label: "Biblio", href: "/library" },
        { icon: Settings, label: "Réglages", href: "/settings" },
    ];

    return (
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-foreground/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/10">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]));
                        const Icon = item.icon;
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px]",
                                    isActive 
                                        ? "bg-primary text-white" 
                                        : "text-white/50 hover:text-white/80 active:bg-white/10"
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-bold tracking-wide",
                                    isActive ? "text-white" : "text-white/50"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
