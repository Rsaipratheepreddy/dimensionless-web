import { NextResponse } from 'next/server';
import { backendFetch } from '@/utils/backend';

export async function GET() {
    try {
        const res = await backendFetch('/api/tokens/config');
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error fetching token platform data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
