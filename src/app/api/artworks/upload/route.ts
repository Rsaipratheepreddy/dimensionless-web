import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const headers = forwardHeaders(request);
        const formData = await request.formData();

        const res = await backendFetch('/api/artworks/upload', {
            method: 'POST',
            headers,
            body: formData,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error uploading artwork images:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const imageId = request.nextUrl.searchParams.get('id');
        const headers = forwardHeaders(request);
        const res = await backendFetch(`/api/artworks/upload?id=${imageId}`, {
            method: 'DELETE',
            headers,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error deleting artwork image:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
