import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/user/registrations - Fetch current user's active registrations and upcoming sessions
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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch active registrations with class and its next session
        const { data: registrations, error } = await supabase
            .from('art_class_registrations')
            .select(`
                id,
                status,
                expires_at,
                art_classes (
                    id,
                    title,
                    thumbnail_url,
                    art_class_categories(name)
                )
            `)
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (error) throw error;

        // For each class, fetch the closest upcoming session
        const today = new Date().toISOString().split('T')[0];

        const enhancedRegistrations = await Promise.all((registrations || []).map(async (reg: any) => {
            const { data: nextSession } = await supabase
                .from('art_class_sessions')
                .select('*')
                .eq('class_id', reg.art_classes.id)
                .gte('session_date', today)
                .order('session_date', { ascending: true })
                .order('session_time', { ascending: true })
                .limit(1)
                .single();

            return {
                ...reg,
                next_session: nextSession
            };
        }));

        return NextResponse.json(enhancedRegistrations);
    } catch (error) {
        console.error('Error fetching user registrations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
