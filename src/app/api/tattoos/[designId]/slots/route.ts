import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/tattoos/[designId]/slots?date=YYYY-MM-DD
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        const supabase = await createClient();

        let query = supabase
            .from('tattoo_slots')
            .select('*')
            .order('start_time');

        if (date) {
            query = query.eq('date', date);
        }

        const { data: slots, error } = await query;

        if (error) throw error;

        return NextResponse.json(slots || []);
    } catch (error) {
        console.error('Error fetching slots:', error);
        return NextResponse.json(
            { error: 'Failed to fetch slots' },
            { status: 500 }
        );
    }
}
