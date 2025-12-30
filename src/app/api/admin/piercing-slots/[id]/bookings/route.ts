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

// GET /api/admin/piercing-slots/[id]/bookings
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const verification = await verifyAdmin(supabase);
        if ('error' in verification) {
            return NextResponse.json({ error: verification.error }, { status: verification.status });
        }

        const { id } = await params;

        // Get bookings for this slot
        const { data: bookings, error } = await supabase
            .from('piercing_bookings')
            .select(`
                *,
                piercing_designs (
                    name,
                    image_url
                ),
                profiles:profiles!piercing_bookings_user_id_fkey (
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
