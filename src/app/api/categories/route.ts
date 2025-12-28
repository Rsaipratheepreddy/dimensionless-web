import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/categories - Get categories (optionally filtered by type)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        console.log('Fetching categories for type:', type);

        // Art classes use a separate table
        if (type === 'art_class' || type === 'class') {
            const { data: artCategories, error: artError } = await supabase
                .from('art_class_categories')
                .select('*')
                .order('name');

            if (artError) {
                console.error('Error fetching art class categories:', artError);
                return NextResponse.json([]);
            }
            return NextResponse.json(artCategories || []);
        }

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
            return NextResponse.json([]);
        }

        return NextResponse.json(categories || []);
    } catch (error: any) {
        console.error('Error in categories API:', error);
        return NextResponse.json([]);
    }
}
