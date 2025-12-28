import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check for admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: bookings, error } = await supabase
            .from('tattoo_bookings')
            .select(`
                *,
                tattoo_designs (
                    name,
                    image_url
                ),
                profiles:profiles!tattoo_bookings_user_id_fkey (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching admin bookings:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json(bookings || []);
    } catch (error: any) {
        console.error('Error fetching admin bookings:', error);
        return NextResponse.json([]);
    }
}
