import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/admin/tattoo-slots/[id]/bookings
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;

        // Get bookings for this slot
        const { data: bookings, error } = await supabase
            .from('tattoo_bookings')
            .select(`
                *,
                tattoo_designs (
                    name,
                    image_url
                ),
                profiles:profiles!tattoo_bookings_user_id_fkey (
                    full_name,
                    email
                )
            `)
            .eq('slot_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(bookings || []);
    } catch (error) {
        console.error('Error fetching slot bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch slot bookings' },
            { status: 500 }
        );
    }
}
