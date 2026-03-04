"use client";

import { ThemeType } from './ThemeConfig';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReadHeaderProps {
    title: string;
    theme: ThemeType;
    currentIndex: number;
    totalParagraphs: number;
}

export function ReadHeader({ title, theme, currentIndex, totalParagraphs }: ReadHeaderProps) {
    const router = useRouter();
    const progressPct = Math.max(2, (currentIndex / Math.max(1, totalParagraphs - 1)) * 100);

    return (
        <div className={cn(
            "sticky top-0 z-40 backdrop-blur-xl border-b flex flex-col transition-colors duration-300",
            theme === 'dark' ? 'bg-[#0C0A09]/90 border-stone-800/50 text-stone-200'
                : theme === 'light' ? 'bg-white/90 border-stone-200/50 text-stone-800'
                    : 'bg-[#F5E9D9]/90 border-stone-300/30 text-[#2D2D2D]'
        )}>
            {/* Progress Bar (Animated) */}
            <div className="h-1 w-full bg-black/5 dark:bg-white/5 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            <div className="px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className={cn(
                        "p-2 rounded-xl transition-colors shrink-0",
                        theme === 'dark' ? 'hover:bg-stone-800 text-stone-200' : 'hover:bg-stone-200/50 text-stone-800'
                    )}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="font-serif font-bold text-base md:text-lg truncate pr-2 flex-1">{title}</h1>
                <span className={cn(
                    "text-[10px] md:text-[11px] font-mono px-2 py-1 rounded-lg shrink-0",
                    theme === 'dark' ? 'bg-stone-800 text-stone-400' : 'bg-stone-200/50 text-stone-500'
                )}>
                    §{currentIndex + 1}/{totalParagraphs}
                </span>
            </div>
        </div>
    );
}
