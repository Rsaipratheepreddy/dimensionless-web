import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

async function verifyAdmin(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Unauthorized', status: 401 };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 };
    return { user };
}

// PUT /api/admin/piercings/[id] - Update piercing design
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const verification = await verifyAdmin(supabase);
        if ('error' in verification) {
            return NextResponse.json({ error: verification.error }, { status: verification.status });
        }

        const body = await request.json();
        const { id } = await params;

        // Sanitize UUID fields
        const updateData = { ...body };
        if (updateData.category_id === '') updateData.category_id = null;
        if (updateData.artist_id === '') updateData.artist_id = null;

        const { data: design, error } = await supabase
            .from('piercing_designs')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(design);
    } catch (error) {
        console.error('Error updating piercing design:', error);
        return NextResponse.json(
            { error: 'Failed to update design' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/piercings/[id] - Delete piercing design
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const verification = await verifyAdmin(supabase);
        if ('error' in verification) {
            return NextResponse.json({ error: verification.error }, { status: verification.status });
        }

        const { id } = await params;

        const { error } = await supabase
            .from('piercing_designs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting piercing design:', error);
        return NextResponse.json(
            { error: 'Failed to delete design' },
            { status: 500 }
        );
    }
}
