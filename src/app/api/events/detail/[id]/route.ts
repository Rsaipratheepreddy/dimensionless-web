import { createClient } from '@/utils/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        // 1. Fetch event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select(`
                *,
                category:event_categories(name)
            `)
            .eq('id', id)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 2. Check if current user is registered
        const { data: { user } } = await supabase.auth.getUser();
        let isRegistered = false;

        if (user) {
            const { data: reg } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', id)
                .eq('user_id', user.id)
                .single();
            isRegistered = !!reg;
        }

        return NextResponse.json({
            ...event,
            category_name: event.category?.name || 'General',
            is_registered: isRegistered
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
