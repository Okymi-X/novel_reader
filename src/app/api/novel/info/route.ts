import { getNovelInfoUseCase } from '@/infrastructure/di';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    // Use default URL if none provided, for now focusing on LOTM as requested
    const targetUrl = url || 'https://lightnovelfr.com/series/lord-of-the-mysteries/';

    try {
        const novelInfo = await getNovelInfoUseCase.execute(targetUrl);
        return NextResponse.json(novelInfo);
    } catch (error) {
        console.error("Error in GET /api/novel/info:", error);
        return NextResponse.json({ error: 'Failed to fetch novel info' }, { status: 500 });
    }
}
