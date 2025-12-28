import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

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

        const supabase = await createClient();

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

        if (classError) {
            console.error('Error fetching art class:', classError);
            return NextResponse.json({ error: 'Art class not found' }, { status: 404 });
        }

        // 2. Check if user is registered (fetch any status)
        let registration = null;
        if (user) {
            const { data: reg } = await supabase
                .from('art_class_registrations')
                .select('*')
                .eq('user_id', user.id)
                .eq('class_id', id)
                .maybeSingle();
            registration = reg;
        }

        // 3. Fetch sessions
        // Only show link if registration status is 'active'
        const showLinks = registration?.status === 'active';
        const sessionSelect = showLinks
            ? 'id, session_title, session_date, session_time, session_link'
            : 'id, session_title, session_date, session_time';

        const { data: sessions, error: sessionError } = await supabase
            .from('art_class_sessions')
            .select(sessionSelect)
            .eq('class_id', id)
            .order('session_date', { ascending: true })
            .order('session_time', { ascending: true });

        if (sessionError) {
            console.error('Error fetching sessions:', sessionError);
        }

        return NextResponse.json({
            ...artClass,
            category_name: (artClass.art_class_categories as any)?.name || 'General',
            sessions: sessions || [],
            is_registered: !!registration,
            registration_details: registration
        });
    } catch (error) {
        console.error('Error fetching art class details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
