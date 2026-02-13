import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// POST /api/art-classes/verify - Verify Razorpay payment and activate registration
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const headers = forwardHeaders(req);
        const res = await backendFetch('/api/art-classes/verify', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Art class verification error:', error);
        return NextResponse.json({ error: 'Payment verification failed', details: error.message }, { status: 500 });
    }
}
