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
        { icon: <Home className="w-6 h-6" />, label: "Accueil", href: "/" },
        { icon: <Search className="w-6 h-6" />, label: "Roman", href: "/search" },
        { icon: <Library className="w-6 h-6" />, label: "Biblio", href: "/library" },
        { icon: <Settings className="w-6 h-6" />, label: "Réglages", href: "/settings" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-50 pb-safe">
            <div className="flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16",
                                isActive ? "text-primary" : "text-foreground/40 hover:text-foreground/70"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-full transition-all duration-300",
                                isActive ? "bg-primary/20 scale-110" : ""
                            )}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
