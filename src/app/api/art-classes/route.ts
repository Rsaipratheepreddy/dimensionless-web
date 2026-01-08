import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/art-classes - Fetch published classes for users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const pricing = searchParams.get('pricing');

        const supabase = await createClient();

        console.log('Fetching art classes with params:', { category, pricing });

        let query = supabase
            .from('art_classes')
            .select(`
                *,
                art_class_categories(name)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (category && category !== 'all') query = query.eq('category_id', category);
        if (pricing && pricing !== 'all') query = query.eq('pricing_type', pricing);

        const { data: classes, error } = await query;

        if (error) {
            console.error('Error fetching art classes:', error);
            return NextResponse.json([]);
        }

        console.log(`Found ${classes?.length || 0} published art classes`);

        // Fetch session counts separately for each class
        const classesWithSessions = await Promise.all(
            (classes || []).map(async (artClass: any) => {
                const { count } = await supabase
                    .from('art_class_sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('class_id', artClass.id);

                return {
                    ...artClass,
                    category_name: (artClass.art_class_categories as any)?.name || 'General',
                    session_count: count || 0
                };
            })
        );

        return NextResponse.json(classesWithSessions);
    } catch (error: any) {
        console.error('Unexpected error in art-classes API:', error);
        return NextResponse.json([]);
    }
}
