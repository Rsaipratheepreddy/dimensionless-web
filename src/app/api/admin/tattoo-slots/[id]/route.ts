import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// DELETE /api/admin/tattoo-slots/[id] - Delete slot
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/tattoo-slots/${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting slot:', error);
        return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
    }
}
