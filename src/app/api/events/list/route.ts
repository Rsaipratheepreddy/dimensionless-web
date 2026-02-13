import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

// GET /api/events/list - Public events listing with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams.toString();
        const path = `/api/events/list${searchParams ? `?${searchParams}` : ''}`;
        const res = await backendFetch(path);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Error fetching events list:', error);
        return NextResponse.json([], { status: 500 });
    }
}
