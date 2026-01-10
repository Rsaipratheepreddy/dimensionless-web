import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { data: artworks, error } = await supabase
            .from('artworks')
            .select(`
                *,
                artist:profiles!artworks_artist_id_fkey(full_name, avatar_url),
                images:artwork_images(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(artworks);
    } catch (error: any) {
        console.error('Error fetching admin artworks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();

        const { data: artwork, error } = await supabase
            .from('artworks')
            .insert([{
                ...body,
                artist_id: body.artist_id || user.id,
                status: 'published',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(artwork, { status: 201 });
    } catch (error: any) {
        console.error('Error creating artwork:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
