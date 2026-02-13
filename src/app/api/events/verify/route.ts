import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const headers = forwardHeaders(req);
        const res = await backendFetch('/api/events/verify', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Event verification error:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
