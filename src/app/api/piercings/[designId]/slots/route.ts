import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

// GET /api/piercings/[designId]/slots?date=YYYY-MM-DD
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
) {
    try {
        const { designId } = await params;
        const searchParams = request.nextUrl.searchParams.toString();
        const path = `/api/piercings/${designId}/slots${searchParams ? `?${searchParams}` : ''}`;
        const res = await backendFetch(path);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching slots:', error);
        return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }
}
