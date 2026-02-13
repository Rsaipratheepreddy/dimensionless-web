import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// POST /api/art-classes/checkout - Create Razorpay order for class registration
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const headers = forwardHeaders(req);
        const res = await backendFetch('/api/art-classes/checkout', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Art class checkout error:', error);
        return NextResponse.json({ error: 'Failed to create payment order', details: error.message }, { status: 500 });
    }
}
