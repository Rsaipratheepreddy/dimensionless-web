import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// PATCH /api/bookings/[bookingId] - Update booking status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { bookingId } = await params;
        const body = await request.json();

        const { data: booking, error } = await supabase
            .from('tattoo_bookings')
            .update(body)
            .eq('id', bookingId)
            // Ensure user can only update their own booking OR is admin (RLS should handle this, but good to be explicit here)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(booking);
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
        );
    }
}

// GET /api/bookings/[bookingId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { bookingId } = await params;

        const { data: booking, error } = await supabase
            .from('tattoo_bookings')
            .select(`
                *,
                tattoo_designs (
                    name,
                    image_url
                )
            `)
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return NextResponse.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Failed to fetch booking' },
            { status: 500 }
        );
    }
}
