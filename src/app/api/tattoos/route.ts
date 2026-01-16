import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/tattoos - Get all active tattoo designs (public)
// TEMPORARY: Using service role to bypass RLS until migration is run
export async function GET(request: NextRequest) {
    try {
        // Use service role to bypass RLS (temporary workaround)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data: designs, error } = await supabase
            .from('tattoo_designs')
            .select(`
                id, 
                name, 
                description, 
                category_id, 
                size, 
                estimated_duration, 
                base_price, 
                image_url,
                is_active,
                created_at
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching tattoo designs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(designs || [], {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error: any) {
        console.error('Error fetching tattoo designs:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
