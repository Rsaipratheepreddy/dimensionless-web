import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

// GET /api/tattoos/[designId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
) {
    try {
        const { designId } = await params;
        const res = await backendFetch(`/api/tattoos/${designId}`);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching design:', error);
        return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 });
    }
}
