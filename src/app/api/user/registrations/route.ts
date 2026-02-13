import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, forwardHeaders } from '@/utils/backend';

// GET /api/user/registrations - Fetch current user's active registrations and upcoming sessions
export async function GET(request: NextRequest) {
    try {
        const headers = forwardHeaders(request);
        const res = await backendFetch('/api/users/registrations', { headers });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error('Error fetching user registrations:', error);
        return NextResponse.json([]);
    }
}
