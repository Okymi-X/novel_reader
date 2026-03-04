import { useRef, useState } from "react";

interface ProgressBarProps {
    currentParagraph: number;
    totalParagraphs: number;
    onSeek: (index: number) => void;
}

export function ProgressBar({ currentParagraph, totalParagraphs, onSeek }: ProgressBarProps) {
    const [isDragging, setIsDragging] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

    const progressPct = totalParagraphs > 0 ? ((currentParagraph + 1) / totalParagraphs) * 100 : 0;

    const handleProgressInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = x / rect.width;
        const idx = Math.round(pct * (totalParagraphs - 1));
        onSeek(Math.max(0, Math.min(totalParagraphs - 1, idx)));
    };

    return (
        <div
            ref={progressRef}
            className="relative h-7 cursor-pointer group px-4 flex items-center"
            onClick={handleProgressInteraction}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={(e) => isDragging && handleProgressInteraction(e)}
        >
            {/* Track Background */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 group-hover:h-1.5 bg-stone-200/80 dark:bg-stone-700/60 rounded-full transition-all duration-200" />

            {/* Active Track */}
            <div
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 group-hover:h-1.5 rounded-full transition-all duration-200"
                style={{
                    width: `calc(${progressPct}% - 2rem)`,
                    background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 70%, transparent))',
                }}
            />

            {/* Thumb */}
            <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                style={{ left: `calc(1rem + ${progressPct}% - ${progressPct * 2 / 100}rem)` }}
            >
                <div className="w-3.5 h-3.5 bg-background rounded-full shadow-md border-2 border-primary" />
            </div>

            {/* Time Labels */}
            <div className="absolute left-4 -top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500">{currentParagraph + 1}</span>
            </div>
            <div className="absolute right-4 -top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500">{totalParagraphs}</span>
            </div>
        </div>
    );
}
