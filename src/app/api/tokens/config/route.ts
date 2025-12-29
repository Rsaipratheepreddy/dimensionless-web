import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Fetch Token Config from home_config
        const { data: config, error: configError } = await supabase
            .from('home_config')
            .select('*')
            .eq('id', 'token_launch_config')
            .single();

        // 2. Fetch Blue Chip Art
        const { data: blueChip, error: bcError } = await supabase
            .from('blue_chip_art')
            .select('*')
            .order('created_at', { ascending: false });

        return NextResponse.json({
            config: config?.config_data || {},
            blueChip: blueChip || []
        });

    } catch (error) {
        console.error('Error fetching token platform data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
