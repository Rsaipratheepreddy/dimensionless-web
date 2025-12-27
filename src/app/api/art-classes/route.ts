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
                art_class_categories(name)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (category) query = query.eq('category_id', category);
        if (pricing && pricing !== 'all') query = query.eq('pricing_type', pricing);

        const { data: classes, error } = await query;

        if (error) {
            console.error('Error fetching art classes:', error);
            return NextResponse.json([]);
        }

        // Fetch session counts separately for each class
        const classesWithSessions = await Promise.all(
            (classes || []).map(async (artClass) => {
                const { count } = await supabase
                    .from('art_class_sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', artClass.id);

                return {
                    ...artClass,
                    category_name: artClass.art_class_categories?.name,
                    session_count: count || 0
                };
            })
        );

        return NextResponse.json(classesWithSessions);
    } catch (error: any) {
        console.error('Error fetching public classes:', error);
        return NextResponse.json([]);
    }
}
