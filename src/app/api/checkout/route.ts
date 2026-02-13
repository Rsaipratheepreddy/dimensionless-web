import { NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const headers = forwardHeaders(req);
        const res = await backendFetch('/api/payments/checkout', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Checkout error:', error.message);
        return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
    }
}
