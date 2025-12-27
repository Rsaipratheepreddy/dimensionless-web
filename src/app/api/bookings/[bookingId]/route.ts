import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// PATCH /api/bookings/[bookingId] - Update booking status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
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

        const { bookingId } = await params;
        const body = await request.json();

        const { data: booking, error } = await supabase
            .from('tattoo_bookings')
            .update(body)
            .eq('id', bookingId)
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
