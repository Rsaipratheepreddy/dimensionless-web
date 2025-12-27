import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/admin/tattoos - Get all tattoo designs
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

        const { data: designs, error } = await supabase
            .from('tattoo_designs')
            .select(`
                *,
                category:categories(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedDesigns = (designs || []).map(d => ({
            ...d,
            category: (d.category as any)?.name || 'General'
        }));

        return NextResponse.json(formattedDesigns);
    } catch (error) {
        console.error('Error fetching tattoo designs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch designs' },
            { status: 500 }
        );
    }
}

// POST /api/admin/tattoos - Create new tattoo design
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

        const body = await request.json();

        const { data: design, error } = await supabase
            .from('tattoo_designs')
            .insert([{
                name: body.name,
                description: body.description,
                category_id: body.category_id || null,
                size: body.size,
                estimated_duration: body.estimated_duration,
                base_price: body.base_price,
                image_url: body.image_url,
                artist_id: body.artist_id || null,
                is_active: body.is_active ?? true
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(design, { status: 201 });
    } catch (error) {
        console.error('Error creating tattoo design:', error);
        return NextResponse.json(
            { error: 'Failed to create design' },
            { status: 500 }
        );
    }
}
