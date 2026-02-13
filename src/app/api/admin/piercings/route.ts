import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/admin/piercings - Get all piercing designs
export async function GET(request: NextRequest) {
    try {
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/piercings', { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Error fetching piercing designs:', error);
        return NextResponse.json([]);
    }
}

// POST /api/admin/piercings - Create new piercing design
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/piercings', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error creating piercing design:', error);
        return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
    }
}
