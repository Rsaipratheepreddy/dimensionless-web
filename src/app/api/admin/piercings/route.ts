import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/admin/piercings - Get all piercing designs
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: designs, error } = await supabase
            .from('piercing_designs')
            .select(`
                *,
                category:categories(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching piercing designs:', error);
            return NextResponse.json([]);
        }

        const formattedDesigns = (designs || []).map(d => ({
            ...d,
            category: (d.category as any)?.name || 'General'
        }));

        return NextResponse.json(formattedDesigns);
    } catch (error: any) {
        console.error('Error fetching piercing designs:', error);
        return NextResponse.json([]);
    }
}

// POST /api/admin/piercings - Create new piercing design
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Security: Verify admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();

        const { data: design, error } = await supabase
            .from('piercing_designs')
            .insert([{
                name: body.name,
                description: body.description,
                category_id: body.category_id || null,
                size: body.size,
                estimated_duration: body.estimated_duration,
                base_price: body.base_price,
                image_url: body.image_url,
                artist_id: body.artist_id || null,
                is_active: body.is_active ?? true
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(design, { status: 201 });
    } catch (error) {
        console.error('Error creating piercing design:', error);
        return NextResponse.json(
            { error: 'Failed to create design' },
            { status: 500 }
        );
    }
}
