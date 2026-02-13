import { NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/admin/staff-tasks/${id}/claim`, {
            method: 'POST',
            headers,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error claiming task:', error);
        return NextResponse.json({ error: 'Failed to claim task' }, { status: 500 });
    }
}
