import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

async function verifyAdmin(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized', status: 401 };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 };
    return { user };
}

// GET /api/admin/art-classes/[id]/attendees - Fetch attendees (registrations) for a class
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
        const verification = await verifyAdmin(supabase);
        if ('error' in verification) {
            return NextResponse.json({ error: verification.error }, { status: verification.status });
        }

        // Fetch registrations with user profiles
        const { data: attendees, error } = await supabase
            .from('art_class_registrations')
            .select(`
                *,
                user:profiles(
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            `)
            .eq('class_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(attendees);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
