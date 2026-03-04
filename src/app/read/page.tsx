"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useChapterLoader } from '@/presentation/hooks/useChapterLoader';
import { useAudioReader } from '@/presentation/hooks/useAudioReader';
import { useReadingProgress } from '@/presentation/hooks/useReadingProgress';
import { useKeyboardNavigation } from '@/presentation/hooks/useKeyboardNavigation';
import { useAppSettings } from '@/presentation/state/SettingsContext';

import { ReaderView } from '@/components/ReaderView';
import { AudioControls } from '@/components/AudioControls';
import { ReadHeader } from '@/components/reader/ReadHeader';

function ReadContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const url = searchParams.get('url');

    const { chapter, loading, error } = useChapterLoader(url);
    const { settings, updateSettings } = useAppSettings();

    // Visual Settings State
    const [fontSize, setFontSize] = useState(settings.fontSize);
    const [theme, setTheme] = useState(settings.theme);
    const [fontFamily, setFontFamily] = useState(settings.fontFamily);

    const { saveProgress } = useReadingProgress();

    const {
        currentIndex, isPlaying, rate, setRate, pitch, setPitch,
        voices, selectedVoice, setVoiceByName, togglePlay,
        next: nextParagraph, prev: prevParagraph, seekTo, setParagraph,
    } = useAudioReader(chapter?.paragraphs || []);

    // Set Audio settings to global defaults once on load
    useEffect(() => {
        setRate(settings.rate);
        setPitch(settings.pitch);
        if (settings.voiceName) setVoiceByName(settings.voiceName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.rate, settings.pitch, settings.voiceName]);

    // Handle scroll updates
    const handleScrollChange = (index: number) => {
        if (!isPlaying) setParagraph(index);
    };

    // Save Progress Effect
    useEffect(() => {
        if (chapter && url) {
            const novelUrl = url.split('-chapitre')[0] || url;
            saveProgress({
                novelUrl,
                novelTitle: chapter.title.split(' - ')[0] || "Novel",
                chapterUrl: url,
                chapterTitle: chapter.title,
                paragraphIndex: currentIndex
            });
        }
    }, [currentIndex, chapter, url, saveProgress]);

    const navigateToChapter = (chapUrl?: string) => {
        if (chapUrl) router.push(`/read?url=${encodeURIComponent(chapUrl)}`);
    }

    const handleNext = () => {
        if (chapter && currentIndex >= chapter.paragraphs.length - 1) {
            if (chapter.nextUrl) navigateToChapter(chapter.nextUrl);
        } else {
            nextParagraph();
        }
    }

    // Register Keyboard Shortcuts
    useKeyboardNavigation({ chapter, togglePlay, handleNext, prevParagraph, navigateToChapter });

    if (!url) return <div>No URL provided.</div>;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-primary gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Loading chapter...</p>
            </div>
        )
    }

    if (error || !chapter) return <div>Error loading content.</div>;

    return (
        <div className={`relative min-h-full h-full overflow-y-auto scroll-smooth flex-1 ${theme === 'dark' ? 'dark' : ''}`}>
            <ReadHeader
                title={chapter.title}
                theme={theme}
                currentIndex={currentIndex}
                totalParagraphs={chapter.paragraphs.length}
            />

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
                isPlaying={isPlaying} onTogglePlay={togglePlay}
                onNext={handleNext} onPrev={prevParagraph}
                currentParagraph={currentIndex} totalParagraphs={chapter.paragraphs.length} onSeek={seekTo}
                rate={rate} onRateChange={setRate} pitch={pitch} onPitchChange={setPitch}
                voices={voices} selectedVoice={selectedVoice}
                onVoiceChange={(name) => { setVoiceByName(name); updateSettings({ voiceName: name }); }}
                fontSize={fontSize} onFontSizeChange={(size) => { setFontSize(size); updateSettings({ fontSize: size }); }}
                theme={theme} onThemeChange={(val) => { setTheme(val); updateSettings({ theme: val }); }}
                fontFamily={fontFamily} onFontFamilyChange={(font) => { setFontFamily(font); updateSettings({ fontFamily: font }); }}
                title={chapter.title}
                hasNextChapter={!!chapter.nextUrl} hasPrevChapter={!!chapter.prevUrl}
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
