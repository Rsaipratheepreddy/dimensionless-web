import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await backendFetch(`/api/art-leasing/${id}`);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching leasing painting:', error);
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
