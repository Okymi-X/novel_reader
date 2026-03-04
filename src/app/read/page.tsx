"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Chapter } from '@/types';
import { useAudioReader } from '@/hooks/useAudioReader';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useAppSettings } from '@/contexts/SettingsContext';
import { ReaderView } from '@/components/ReaderView';
import { AudioControls } from '@/components/AudioControls';
import { Loader2 } from 'lucide-react';

function ReadContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const url = searchParams.get('url');

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Global Settings
    const { settings, updateSettings } = useAppSettings();

    // Visual Settings State
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [theme, setTheme] = useState(settings.theme);
    const [fontFamily, setFontFamily] = useState(settings.fontFamily);

    // Persistence Hook
    const { saveProgress, getProgress } = useReadingProgress();

    // Fetch Chapter
    useEffect(() => {
        if (!url) return;

        const loadChapter = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/novel?url=${encodeURIComponent(url)}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch chapter');
                const data = await res.json();
                setChapter(data);
            } catch (err) {
                setError('Failed to load content. Please check the URL.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadChapter();
    }, [url]);

    const {
        currentIndex,
        isPlaying,
        rate,
        setRate,
        pitch,
        setPitch,
        voices,
        selectedVoice,
        setVoiceByName,
        togglePlay,
        next: nextParagraph,
        prev: prevParagraph,
        seekTo,
        play,
        setParagraph,
    } = useAudioReader(chapter?.paragraphs || []);

    // Set Audio settings to global defaults once on load
    useEffect(() => {
        setRate(settings.rate);
        setPitch(settings.pitch);
        if (settings.voiceName) setVoiceByName(settings.voiceName);
        // We only want to run this once when the chapter basically loads, 
        // avoiding infinite loops if the user changes settings locally but doesn't want global save.
        // Actually, if we want full sync: we just pass the updater down.
    }, [settings.rate, settings.pitch, settings.voiceName]);

    // Handle scroll updates
    const handleScrollChange = (index: number) => {
        // Only update progress/index via scroll if we are NOT playing audio
        // This prevents the audio from skipping around or restarting as you read
        if (!isPlaying) {
            setParagraph(index);
        }
    };

    // Restore Progress on Load
    useEffect(() => {
        if (chapter && url) {
            // Check if we have progress for this specific chapter
            // Actually, getProgress is by novelUrl. We need to check if the saved chapter matches this one?
            // Or simpler: We just save progress per novel.
            // But if we are loading a specific chapter URL, we might want to know if we read it before?
            // For now, let's just stick to "Current Session" or "Refined Progress".
            // Let's rely on useAudioReader's seekTo.
            // Wait, we need the NOVEL ID/URL. We don't have it cleanly here, using chapter URL as key for now.
            // Actually, let's use the chapter URL itself as the key for simplicity in this MVP.
            // Improvement: The scraper could return the 'novelUrl' parent.
        }
    }, [chapter, url]);

    // Save Progress Effect
    useEffect(() => {
        if (chapter && url) {
            // Debounce or just save on change?
            // Save every time paragraph changes
            const novelUrl = url.split('-chapitre')[0] || url; // Rudimentary novel ID extraction

            saveProgress({
                novelUrl: novelUrl,
                novelTitle: chapter.title.split(' - ')[0] || "Novel", // Guessing title 
                chapterUrl: url,
                chapterTitle: chapter.title,
                paragraphIndex: currentIndex
            });
        }
    }, [currentIndex, chapter, url, saveProgress]);

    // Automatic Chapter Navigation
    useEffect(() => {
        if (chapter && isPlaying && currentIndex >= chapter.paragraphs.length - 1) {
            // End of chapter logic handled in handleNext usually
        }
    }, [currentIndex, isPlaying, chapter]);

    const navigateToChapter = (chapUrl?: string) => {
        if (chapUrl) {
            router.push(`/read?url=${encodeURIComponent(chapUrl)}`);
        }
    }

    const handleNext = () => {
        if (chapter && currentIndex >= chapter.paragraphs.length - 1) {
            if (chapter.nextUrl) {
                navigateToChapter(chapter.nextUrl);
            }
        } else {
            nextParagraph();
        }
    }

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent shortcuts if user is typing in an input (though unlikely in reader, still good practice)
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault(); // Prevent scrolling
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
    }, [togglePlay, handleNext, prevParagraph, chapter]);

    if (!url) return <div>No URL</div>;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Loading chapter...</p>
            </div>
        )
    }

    if (error || !chapter) return <div>Error loading</div>;

    return (
        <div className={`relative min-h-full h-full overflow-y-auto scroll-smooth flex-1 ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Top Fixed Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-xl border-b flex flex-col transition-colors duration-300 ${theme === 'dark'
                ? 'bg-[#0C0A09]/90 border-stone-800/50 text-stone-200'
                : theme === 'light' ? 'bg-white/90 border-stone-200/50 text-stone-800'
                    : 'bg-[#F5E9D9]/90 border-stone-300/30 text-[#2D2D2D]'
                }`}>

                {/* Progress Bar (Animated) */}
                <div className="h-1 w-full bg-black/5 dark:bg-white/5 relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(2, (currentIndex / (chapter.paragraphs.length - 1)) * 100)}%` }}
                    />
                </div>

                <div className="px-6 py-3.5 flex items-center gap-4 pl-16 md:pl-6">
                    <h1 className="font-serif font-bold text-lg truncate pr-4 flex-1">{chapter.title}</h1>
                    <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg ${theme === 'dark'
                        ? 'bg-stone-800 text-stone-400'
                        : 'bg-stone-200/50 text-stone-500'
                        }`}>
                        §{currentIndex + 1}/{chapter.paragraphs.length}
                    </span>
                </div>
            </div>

            <ReaderView
                paragraphs={chapter.paragraphs}
                currentParagraphIndex={currentIndex}
                onParagraphClick={seekTo}
                onActiveParagraphChange={handleScrollChange}
                fontSize={fontSize}
                theme={theme}
                fontFamily={fontFamily}
            />

            <AudioControls
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={handleNext}
                onPrev={prevParagraph}

                currentParagraph={currentIndex}
                totalParagraphs={chapter.paragraphs.length}
                onSeek={seekTo}

                rate={rate}
                onRateChange={setRate}
                pitch={pitch}
                onPitchChange={setPitch}
                voices={voices}
                selectedVoice={selectedVoice}
                onVoiceChange={(name) => { setVoiceByName(name); updateSettings({ voiceName: name }); }}

                // Visual Settings
                fontSize={fontSize}
                onFontSizeChange={(size) => { setFontSize(size); updateSettings({ fontSize: size }); }}
                theme={theme}
                onThemeChange={(val) => { setTheme(val); updateSettings({ theme: val }); }}
                fontFamily={fontFamily}
                onFontFamilyChange={(font) => { setFontFamily(font); updateSettings({ fontFamily: font }); }}

                title={chapter.title}

                hasNextChapter={!!chapter.nextUrl}
                hasPrevChapter={!!chapter.prevUrl}
                onNextChapter={() => navigateToChapter(chapter.nextUrl)}
                onPrevChapter={() => navigateToChapter(chapter.prevUrl)}
            />
        </div>
    );
}

export default function ReadPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <ReadContent />
        </Suspense>
    )
}
