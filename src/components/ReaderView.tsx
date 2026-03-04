"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Paragraph } from '@/types';
import { cn } from '@/lib/utils';

interface ReaderViewProps {
    paragraphs: Paragraph[];
    currentParagraphIndex: number;
    onParagraphClick: (index: number) => void;
    onActiveParagraphChange?: (index: number) => void;
    fontSize: number;
    theme: 'paper' | 'light' | 'dark' | 'sepia';
    fontFamily?: 'sans' | 'serif';
}

export function ReaderView({ paragraphs, currentParagraphIndex, onParagraphClick, onActiveParagraphChange, fontSize, theme, fontFamily = 'serif' }: ReaderViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isAutoScrolling = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Auto-scroll to active paragraph
    useEffect(() => {
        const activeEl = document.querySelector(`[data-index="${currentParagraphIndex}"]`);
        if (!activeEl) return;

        isAutoScrolling.current = true;
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const timer = setTimeout(() => { isAutoScrolling.current = false; }, 1000);
        return () => clearTimeout(timer);
    }, [currentParagraphIndex]);

    // IntersectionObserver for manual scroll paragraph detection
    useEffect(() => {
        if (!onActiveParagraphChange) return;

        observerRef.current = new IntersectionObserver((entries) => {
            if (isAutoScrolling.current) return;
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'));
                    if (!isNaN(index)) onActiveParagraphChange(index);
                }
            });
        }, { root: null, rootMargin: '-35% 0px -35% 0px', threshold: 0 });

        const timer = setTimeout(() => {
            document.querySelectorAll('.chapter-paragraph').forEach(el => observerRef.current?.observe(el));
        }, 500);

        return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
    }, [paragraphs, onActiveParagraphChange]);

    const themeConfig = {
        paper: {
            bg: 'bg-[#F5E9D9]',
            text: 'text-[#2D2D2D]',
            activeBg: 'bg-black/5',
            activeBorder: 'border-primary/30',
            activeGlow: 'shadow-[0_0_30px_rgba(255,107,53,0.06)]',
            dimmed: 'text-[#2D2D2D]/35',
            future: 'text-[#2D2D2D]/50',
            divider: 'bg-[#2D2D2D]/10',
        },
        light: {
            bg: 'bg-card',
            text: 'text-card-foreground',
            activeBg: 'bg-muted/50',
            activeBorder: 'border-primary/20',
            activeGlow: 'shadow-[0_0_30px_rgba(0,0,0,0.03)]',
            dimmed: 'text-card-foreground/30',
            future: 'text-card-foreground/45',
            divider: 'bg-border',
        },
        dark: {
            bg: 'bg-background',
            text: 'text-foreground',
            activeBg: 'bg-muted/30',
            activeBorder: 'border-primary/20',
            activeGlow: 'shadow-[0_0_40px_rgba(255,107,53,0.05)]',
            dimmed: 'text-foreground/20',
            future: 'text-foreground/35',
            divider: 'bg-border',
        },
        sepia: {
            bg: 'bg-[#F4ECD8]',
            text: 'text-[#433422]',
            activeBg: 'bg-[#EAE0C8]',
            activeBorder: 'border-[#D9A05B]/40',
            activeGlow: 'shadow-[0_0_30px_rgba(217,160,91,0.06)]',
            dimmed: 'text-[#433422]/35',
            future: 'text-[#433422]/50',
            divider: 'bg-[#433422]/10',
        },
    };

    const t = themeConfig[theme] || themeConfig.paper;

    return (
        <div className={cn("min-h-screen transition-colors duration-500 relative", t.bg, t.text)}>
            <div ref={containerRef} className="max-w-2xl mx-auto px-6 md:px-16 py-16 pb-48">
                {paragraphs.map((p, index) => {
                    const isActive = index === currentParagraphIndex;
                    const isPast = index < currentParagraphIndex;

                    return (
                        <div
                            key={p.id}
                            data-index={index}
                            onClick={() => onParagraphClick(index)}
                            className={cn(
                                "chapter-paragraph transition-all duration-500 ease-out cursor-pointer relative",
                                // Active paragraph — highlighted with subtle background + left accent
                                isActive && [
                                    "rounded-xl px-5 py-4 -mx-5",
                                    t.activeBg,
                                    "border-l-[3px]",
                                    t.activeBorder,
                                    t.activeGlow,
                                ].join(' '),
                                // Non-active — no background
                                !isActive && "px-0 py-0",
                            )}
                        >
                            {p.type === 'image' && p.imageUrl ? (
                                <div className={cn(
                                    "relative w-full aspect-[3/4] md:aspect-video rounded-2xl overflow-hidden my-6 bg-black/5 transition-all duration-500",
                                    isActive
                                        ? "shadow-xl ring-1 ring-[#FF6B35]/20"
                                        : isPast ? "opacity-30" : "opacity-40"
                                )}>
                                    <img
                                        src={p.imageUrl}
                                        alt={p.text || "Chapter Image"}
                                        className="w-full h-full object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            ) : (
                                <p
                                    className={cn(
                                        "mb-6 leading-[1.95] transition-all duration-500",
                                        isActive && "opacity-100",
                                        isPast && !isActive && t.dimmed,
                                        !isPast && !isActive && t.future,
                                    )}
                                    style={{
                                        fontFamily: fontFamily === 'sans' ? 'var(--font-sans)' : 'var(--font-serif)',
                                        fontSize: `${fontSize}px`,
                                        letterSpacing: '-0.01em',
                                        wordSpacing: '0.02em',
                                    }}
                                >
                                    {p.text}
                                </p>
                            )}
                        </div>
                    );
                })}

                {/* Chapter End Indicator */}
                <div className="flex items-center justify-center gap-4 pt-12 pb-8">
                    <div className={cn("h-px flex-1", t.divider)} />
                    <span className={cn("text-xs font-medium tracking-widest uppercase", isPastColor(theme))}>
                        Fin du Chapitre
                    </span>
                    <div className={cn("h-px flex-1", t.divider)} />
                </div>
            </div>
        </div>
    );
}

function isPastColor(theme: string): string {
    if (theme === 'dark') return 'text-stone-600';
    return 'text-stone-400';
}
