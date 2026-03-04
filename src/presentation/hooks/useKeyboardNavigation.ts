import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chapter } from '@/core/entities/Novel';

interface UseKeyboardNavigationProps {
    chapter: Chapter | null;
    togglePlay: () => void;
    handleNext: () => void;
    prevParagraph: () => void;
    navigateToChapter: (url?: string) => void;
}

export function useKeyboardNavigation({
    chapter,
    togglePlay,
    handleNext,
    prevParagraph,
    navigateToChapter
}: UseKeyboardNavigationProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Empêcher les raccourcis si l'utilisateur tape dans un input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault(); // Empêcher le défilement
                    togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (e.shiftKey && chapter?.nextUrl) {
                        navigateToChapter(chapter.nextUrl);
                    } else {
                        handleNext();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (e.shiftKey && chapter?.prevUrl) {
                        navigateToChapter(chapter.prevUrl);
                    } else {
                        prevParagraph();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, handleNext, prevParagraph, chapter, navigateToChapter]);
}
