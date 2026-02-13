import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// PUT /api/admin/tattoos/[id] - Update tattoo design
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/tattoos/${id}`, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error updating tattoo design:', error);
        return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
    }
}

// DELETE /api/admin/tattoos/[id] - Delete tattoo design
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/tattoos/${id}`, {
            method: 'DELETE',
            headers,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting tattoo design:', error);
        return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }
}
