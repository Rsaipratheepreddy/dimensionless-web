import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// POST /api/bookings - Create new tattoo booking
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Determine booking table and type (default to tattoo)
        const isPiercing = body.booking_type === 'piercing';
        const tableName = isPiercing ? 'piercing_bookings' : 'tattoo_bookings';

        // Handle virtual/default slots (IDs starting with 'default-')
        let slotId = body.slot_id;
        if (slotId && String(slotId).startsWith('default-')) {
            slotId = null;
        }

        // Determine booking status based on payment method and slot type
        let bookingStatus = 'pending_verification';
        let paymentStatus = 'pending';

        if (body.payment_method === 'online') {
            bookingStatus = 'payment_pending';
            paymentStatus = 'pending';
        } else if (body.payment_method === 'counter') {
            bookingStatus = 'pending_verification';
            paymentStatus = 'pending';
        }

        // If no slot_id (flexible or default booking), status should be pending_verification
        if (!slotId) {
            bookingStatus = 'pending_verification';
        }

        const { data: booking, error } = await supabase
            .from(tableName)
            .insert([{
                user_id: user.id,
                design_id: body.design_id,
                slot_id: slotId || null,
                booking_date: body.booking_date,
                booking_time: body.booking_time,
                final_price: body.final_price,
                payment_method: body.payment_method,
                payment_status: paymentStatus,
                status: bookingStatus,
                custom_notes: body.custom_notes || null,
                reference_images: body.reference_images || null,
                user_mobile: body.user_mobile || null
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch both tattoo and piercing bookings in parallel
        const [tattooRes, piercingRes] = await Promise.all([
            supabase
                .from('tattoo_bookings')
                .select(`
                    *,
                    tattoo_designs (
                        name,
                        description,
                        image_url,
                        base_price
                    )
                `)
                .eq('user_id', user.id),
            supabase
                .from('piercing_bookings')
                .select(`
                    *,
                    piercing_designs (
                        name,
                        description,
                        image_url,
                        base_price
                    )
                `)
                .eq('user_id', user.id)
        ]);

        if (tattooRes.error) console.error('Error fetching tattoo bookings:', tattooRes.error);
        if (piercingRes.error) console.error('Error fetching piercing bookings:', piercingRes.error);

        // Map piercing designs to a consistent structure and combine
        const tattooBookings = (tattooRes.data || []).map(b => ({
            ...b,
            booking_type: 'tattoo',
            design: b.tattoo_designs
        }));

        const piercingBookings = (piercingRes.data || []).map(b => ({
            ...b,
            booking_type: 'piercing',
            design: b.piercing_designs
        }));

        const allBookings = [...tattooBookings, ...piercingBookings].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json(allBookings);
    } catch (error: any) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json([]);
    }
}
