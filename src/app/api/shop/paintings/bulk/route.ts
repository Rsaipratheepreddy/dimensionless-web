import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// POST /api/shop/paintings/bulk - Bulk create paintings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/shop/paintings/bulk', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error bulk creating paintings:', error);
        return NextResponse.json({ error: 'Bulk insert failed' }, { status: 500 });
    }
}
