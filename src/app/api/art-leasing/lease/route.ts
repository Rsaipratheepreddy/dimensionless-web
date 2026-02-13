import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/art-leasing/lease', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error creating lease:', error);
        return NextResponse.json({ error: 'Lease failed' }, { status: 500 });
    }
}
