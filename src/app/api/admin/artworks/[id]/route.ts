import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        const { data: artwork, error } = await supabase
            .from('artworks')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(artwork);
    } catch (error: any) {
        console.error('Error updating artwork:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Delete associated images
        const { error: imgError } = await supabase
            .from('artwork_images')
            .delete()
            .eq('artwork_id', id);

        if (imgError) throw imgError;

        // 2. Delete artwork
        const { error } = await supabase
            .from('artworks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Artwork deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting artwork:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
