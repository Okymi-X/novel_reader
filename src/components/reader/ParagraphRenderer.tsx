"use client";

import { Paragraph } from '@/core/entities/Novel';
import { cn } from '@/lib/utils';
import { themeConfig, ThemeType } from './ThemeConfig';

interface ParagraphRendererProps {
    paragraph: Paragraph;
    index: number;
    currentParagraphIndex: number;
    fontSize: number;
    theme: ThemeType;
    fontFamily: 'sans' | 'serif';
    onClick: (index: number) => void;
}

export function ParagraphRenderer({
    paragraph,
    index,
    currentParagraphIndex,
    fontSize,
    theme,
    fontFamily,
    onClick
}: ParagraphRendererProps) {
    const isActive = index === currentParagraphIndex;
    const isPast = index < currentParagraphIndex;
    const t = themeConfig[theme] || themeConfig.paper;

    return (
        <div
            data-index={index}
            onClick={() => onClick(index)}
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
            {paragraph.type === 'image' && paragraph.imageUrl ? (
                <div className={cn(
                    "relative w-full aspect-[3/4] md:aspect-video rounded-2xl overflow-hidden my-6 bg-black/5 transition-all duration-500",
                    isActive
                        ? "shadow-xl ring-1 ring-[#FF6B35]/20"
                        : isPast ? "opacity-30" : "opacity-40"
                )}>
                    <img
                        src={paragraph.imageUrl}
                        alt={paragraph.text || "Chapter Image"}
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
                    {paragraph.text}
                </p>
            )}
        </div>
    );
}
