import { NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

export const dynamic = 'force-dynamic';

// GET /api/interests/categories - Get all interest categories
export async function GET() {
    try {
        const res = await backendFetch('/api/interests/categories');
        const data = await res.json();
        return NextResponse.json(data, {
            status: res.status,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
