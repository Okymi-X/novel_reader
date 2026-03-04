import { useState, useEffect } from 'react';
import { Chapter } from '@/core/entities/Novel';

export function useChapterLoader(url: string | null) {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return { chapter, loading, error };
}
