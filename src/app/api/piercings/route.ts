import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/piercings - Get all active piercing designs (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: designs, error } = await supabase
            .from('piercing_designs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching piercing designs:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json(designs || []);
    } catch (error: any) {
        console.error('Error fetching piercing designs:', error);
        return NextResponse.json([]);
    }
}
