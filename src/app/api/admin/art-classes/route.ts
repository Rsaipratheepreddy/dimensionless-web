import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/admin/art-classes - Fetch all classes for admin
export async function GET(request: NextRequest) {
    try {
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/art-classes', { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Error fetching admin classes:', error);
        return NextResponse.json([]);
    }
}

// DELETE /api/admin/art-classes?id=UUID
export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing class ID' }, { status: 400 });
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/art-classes?id=${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting class:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/art-classes - Create new class
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/admin/art-classes', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
