import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/tattoos/[designId]/slots?date=YYYY-MM-DD
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

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
