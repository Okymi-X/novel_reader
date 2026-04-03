"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useChapterLoader } from '@/presentation/hooks/useChapterLoader';
import { useElevenLabsReader } from '@/presentation/hooks/useElevenLabsReader';
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

    // Use the new ElevenLabs-enabled audio reader
    const {
        currentIndex, isPlaying, isLoading: audioLoading, error: audioError,
        provider, setProvider, isElevenLabsAvailable,
        rate, setRate, pitch, setPitch,
        browserVoices, selectedBrowserVoice, setBrowserVoiceByName,
        elevenLabsVoices, selectedElevenLabsVoice, setElevenLabsVoice,
        stability, setStability, similarityBoost, setSimilarityBoost,
        kokoroVoices, selectedKokoroVoice, setKokoroVoice,
        togglePlay, next: nextParagraph, prev: prevParagraph, seekTo, setParagraph,
    } = useElevenLabsReader(chapter?.paragraphs || []);

    // Set Audio settings to global defaults once on load
    useEffect(() => {
        setRate(settings.rate);
        setPitch(settings.pitch);
        if (settings.voiceName) setBrowserVoiceByName(settings.voiceName);
        if (settings.ttsProvider) setProvider(settings.ttsProvider);
        if (settings.elevenLabsVoiceId) setElevenLabsVoice(settings.elevenLabsVoiceId);
        if (settings.elevenLabsStability !== undefined) setStability(settings.elevenLabsStability);
        if (settings.elevenLabsSimilarityBoost !== undefined) setSimilarityBoost(settings.elevenLabsSimilarityBoost);
        if (settings.kokoroVoiceId) setKokoroVoice(settings.kokoroVoiceId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onNext={handleNext}
                onPrev={prevParagraph}
                currentParagraph={currentIndex}
                totalParagraphs={chapter.paragraphs.length}
                onSeek={seekTo}
                // TTS Provider
                provider={provider}
                onProviderChange={(p) => { setProvider(p); updateSettings({ ttsProvider: p }); }}
                isElevenLabsAvailable={isElevenLabsAvailable}
                // Browser TTS
                rate={rate}
                onRateChange={setRate}
                pitch={pitch}
                onPitchChange={setPitch}
                voices={browserVoices}
                selectedVoice={selectedBrowserVoice}
                onVoiceChange={(name) => { setBrowserVoiceByName(name); updateSettings({ voiceName: name }); }}
                // ElevenLabs
                elevenLabsVoices={elevenLabsVoices}
                selectedElevenLabsVoice={selectedElevenLabsVoice}
                onElevenLabsVoiceChange={(id) => { setElevenLabsVoice(id); updateSettings({ elevenLabsVoiceId: id }); }}
                stability={stability}
                onStabilityChange={(v) => { setStability(v); updateSettings({ elevenLabsStability: v }); }}
                similarityBoost={similarityBoost}
                onSimilarityBoostChange={(v) => { setSimilarityBoost(v); updateSettings({ elevenLabsSimilarityBoost: v }); }}
                // Kokoro
                kokoroVoices={kokoroVoices}
                selectedKokoroVoice={selectedKokoroVoice}
                onKokoroVoiceChange={(id) => { setKokoroVoice(id); updateSettings({ kokoroVoiceId: id }); }}
                // Visual
                fontSize={fontSize}
                onFontSizeChange={(size) => { setFontSize(size); updateSettings({ fontSize: size }); }}
                theme={theme}
                onThemeChange={(val) => { setTheme(val); updateSettings({ theme: val }); }}
                fontFamily={fontFamily}
                onFontFamilyChange={(font) => { setFontFamily(font); updateSettings({ fontFamily: font }); }}
                // Novel info
                title={chapter.title}
                hasNextChapter={!!chapter.nextUrl}
                hasPrevChapter={!!chapter.prevUrl}
                onNextChapter={() => navigateToChapter(chapter.nextUrl)}
                onPrevChapter={() => navigateToChapter(chapter.prevUrl)}
                // Loading state
                isLoading={audioLoading}
                error={audioError}
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
