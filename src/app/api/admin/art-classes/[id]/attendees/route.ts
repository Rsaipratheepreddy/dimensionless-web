import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/admin/art-classes/[id]/attendees - Fetch attendees (registrations) for a class
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/art-classes/${id}/attendees`, { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching attendees:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
