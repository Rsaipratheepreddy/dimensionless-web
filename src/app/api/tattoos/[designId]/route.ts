import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/tattoos/[designId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
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

        const { designId } = await params;

        const { data: design, error } = await supabase
            .from('tattoo_designs')
            .select('*')
            .eq('id', designId)
            .single();

        if (error) throw error;

        return NextResponse.json(design);
    } catch (error) {
        console.error('Error fetching design:', error);
        return NextResponse.json(
            { error: 'Failed to fetch design' },
            { status: 500 }
        );
    }
}
