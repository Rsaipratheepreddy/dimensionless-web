import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/bookings - Create new tattoo booking
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

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

        // If no slot_id (flexible booking), status should be pending_verification
        if (!body.slot_id) {
            bookingStatus = 'pending_verification';
        }

        const { data: booking, error } = await supabase
            .from('tattoo_bookings')
            .insert([{
                user_id: user.id,
                design_id: body.design_id,
                slot_id: body.slot_id || null,
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
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data: bookings, error } = await supabase
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(bookings || []);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}
