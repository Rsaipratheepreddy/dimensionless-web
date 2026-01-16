import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/tattoos - Get all active tattoo designs (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

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
            .limit(100);

        if (error) {
            console.error('Error fetching tattoo designs:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(designs || []);
    } catch (error: any) {
        console.error('Error fetching tattoo designs:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
