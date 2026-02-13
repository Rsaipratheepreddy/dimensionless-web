import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/shop/paintings - Get current user's paintings
export async function GET(request: NextRequest) {
    try {
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/shop/paintings', { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching paintings:', error);
        return NextResponse.json([], { status: 500 });
    }
}

// POST /api/shop/paintings - Create a new painting
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/shop/paintings', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error creating painting:', error);
        return NextResponse.json({ error: 'Failed to create painting' }, { status: 500 });
    }
}

// DELETE /api/shop/paintings?all=true - Delete all user's paintings
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams.toString();
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/shop/paintings?${searchParams}`, { method: 'DELETE', headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting paintings:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
