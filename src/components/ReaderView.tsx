"use client";

import { useEffect, useRef } from 'react';
import { Paragraph } from '@/core/entities/Novel';
import { cn } from '@/lib/utils';
import { ParagraphRenderer } from './reader/ParagraphRenderer';
import { themeConfig, ThemeType, getPastColor } from './reader/ThemeConfig';

interface ReaderViewProps {
    paragraphs: Paragraph[];
    currentParagraphIndex: number;
    onParagraphClick: (index: number) => void;
    onActiveParagraphChange?: (index: number) => void;
    fontSize: number;
    theme: ThemeType;
    fontFamily?: 'sans' | 'serif';
}

export function ReaderView({
    paragraphs,
    currentParagraphIndex,
    onParagraphClick,
    onActiveParagraphChange,
    fontSize,
    theme,
    fontFamily = 'serif'
}: ReaderViewProps) {
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

    const t = themeConfig[theme] || themeConfig.paper;

    return (
        <div className={cn("min-h-screen transition-colors duration-500 relative", t.bg, t.text)}>
            <div ref={containerRef} className="max-w-2xl mx-auto px-5 md:px-16 pt-8 pb-48">
                {paragraphs.map((p, index) => (
                    <ParagraphRenderer
                        key={p.id}
                        paragraph={p}
                        index={index}
                        currentParagraphIndex={currentParagraphIndex}
                        fontSize={fontSize}
                        theme={theme}
                        fontFamily={fontFamily}
                        onClick={onParagraphClick}
                    />
                ))}

                {/* Chapter End Indicator */}
                <div className="flex items-center justify-center gap-4 pt-12 pb-8">
                    <div className={cn("h-px flex-1", t.divider)} />
                    <span className={cn("text-xs font-medium tracking-widest uppercase", getPastColor(theme))}>
                        Fin du Chapitre
                    </span>
                    <div className={cn("h-px flex-1", t.divider)} />
                </div>
            </div>
        </div>
    );
}
