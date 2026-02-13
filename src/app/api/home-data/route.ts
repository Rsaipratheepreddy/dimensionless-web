import { NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

// Enable static generation with revalidation
export const revalidate = 300; // 5 minutes

// GET /api/home-data - Aggregate data for the home page
export async function GET() {
    try {
        const res = await backendFetch('/api/home-data');
        const data = await res.json();
        return NextResponse.json(data, {
            status: res.status,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error: any) {
        console.error('Error fetching home data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
