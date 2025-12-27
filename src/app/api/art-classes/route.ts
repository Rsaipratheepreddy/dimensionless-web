import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/art-classes - Fetch published classes for users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const pricing = searchParams.get('pricing');

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
            .from('art_classes')
            .select(`
                *,
                art_class_categories(name),
                sessions:art_class_sessions(count)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (category) query = query.eq('category_id', category);
        if (pricing && pricing !== 'all') query = query.eq('pricing_type', pricing);

        const { data: classes, error } = await query;

        if (error) throw error;

        // Formatted response
        const formatted = (classes || []).map(c => ({
            ...c,
            category_name: c.art_class_categories?.name,
            session_count: (c.sessions as any)[0]?.count || 0
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching public classes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
