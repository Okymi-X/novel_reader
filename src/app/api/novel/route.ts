import { getChapterUseCase } from '@/infrastructure/di';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        const chapter = await getChapterUseCase.execute(url);
        return NextResponse.json(chapter);
    } catch (error) {
        console.error("Error in GET /api/novel:", error);
        return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
    }
}
