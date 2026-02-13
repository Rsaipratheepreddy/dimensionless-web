import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/admin/piercing-slots - Get slots for a specific date
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams.toString();
        const path = `/api/admin/piercing-slots${searchParams ? `?${searchParams}` : ''}`;
        const headers = forwardHeaders(request);
        const res = await backendFetch(path, { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Error fetching slots:', error);
        return NextResponse.json([]);
    }
}

// POST /api/admin/piercing-slots - Create new slot
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/piercing-slots', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error creating slot:', error);
        return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 });
    }
}
