import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/categories - Get categories (optionally filtered by type)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        let query = supabase
            .from('categories')
            .select('*')
            .eq('is_active', true);

        if (type) {
            query = query.eq('type', type);
        }

        const { data: categories, error } = await query.order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            // Return empty array instead of error to prevent client-side filter errors
            return NextResponse.json([]);
        }

        return NextResponse.json(categories || []);
    } catch (error: any) {
        console.error('Error in categories API:', error);
        // Return empty array instead of 500 to prevent client crashes
        return NextResponse.json([]);
    }
}
