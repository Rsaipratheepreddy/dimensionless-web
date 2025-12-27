import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/art-classes/[id] - Fetch single class with basic session info
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
        }

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

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch class details
        const { data: artClass, error: classError } = await supabase
            .from('art_classes')
            .select(`
                *,
                art_class_categories(name)
            `)
            .eq('id', id)
            .eq('status', 'published')
            .single();

        if (classError) throw classError;

        // 2. Check if user is registered
        let registration = null;
        if (user) {
            const { data: reg } = await supabase
                .from('art_class_registrations')
                .select('*')
                .eq('user_id', user.id)
                .eq('class_id', id)
                .eq('status', 'active')
                .single();
            registration = reg;
        }

        // 3. Fetch sessions
        // If registered, include session_link. If not, only title/date/time.
        const sessionSelect = registration
            ? 'id, session_title, session_date, session_time, session_link'
            : 'id, session_title, session_date, session_time';

        const { data: sessions, error: sessionError } = await supabase
            .from('art_class_sessions')
            .select(sessionSelect)
            .eq('class_id', id)
            .order('session_date', { ascending: true })
            .order('session_time', { ascending: true });

        if (sessionError) throw sessionError;

        return NextResponse.json({
            ...artClass,
            category_name: artClass.art_class_categories?.name,
            sessions: sessions || [],
            is_registered: !!registration,
            registration_details: registration
        });
    } catch (error) {
        console.error('Error fetching art class details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
