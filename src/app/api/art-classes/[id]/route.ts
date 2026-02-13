import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/art-classes/[id] - Fetch single class with basic session info
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/art-classes/${id}`, { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching art class details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
