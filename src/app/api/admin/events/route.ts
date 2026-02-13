import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/admin/events - Fetch all events for admin
export async function GET(request: NextRequest) {
    try {
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/events', { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Error fetching admin events:', error);
        return NextResponse.json([]);
    }
}

// DELETE /api/admin/events?id=UUID
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/events?id=${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/events', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/admin/events - Update existing event
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/events', {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
