import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/admin/piercing-slots - Get slots for a specific date
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        const supabase = await createClient();

        let query = supabase
            .from('piercing_slots')
            .select('*')
            .order('start_time');

        if (date) {
            query = query.eq('date', date);
        }

        const { data: slots, error } = await query;

        if (error) {
            console.error('Error fetching slots:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json(slots || []);
    } catch (error: any) {
        console.error('Error fetching slots:', error);
        return NextResponse.json([]);
    }
}

// POST /api/admin/piercing-slots - Create new slot
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const body = await request.json();

        const { data: slot, error } = await supabase
            .from('piercing_slots')
            .insert([{
                date: body.date,
                start_time: body.start_time,
                end_time: body.end_time,
                max_bookings: body.max_bookings || 1,
                is_available: true
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(slot, { status: 201 });
    } catch (error) {
        console.error('Error creating slot:', error);
        return NextResponse.json(
            { error: 'Failed to create slot' },
            { status: 500 }
        );
    }
}
