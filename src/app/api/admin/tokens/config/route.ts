import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Check Admin Permission
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // 2. Update Configuration
        const { config_data } = await req.json();

        const { error: updateError } = await supabase
            .from('home_config')
            .update({
                config_data,
                updated_at: new Date().toISOString(),
                updated_by: user.id
            })
            .eq('id', 'token_launch_config');

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Admin token update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
