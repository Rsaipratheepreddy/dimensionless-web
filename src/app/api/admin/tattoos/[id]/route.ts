import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// PUT /api/admin/tattoos/[id] - Update tattoo design
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const body = await request.json();
        const { id } = await params;

        // Sanitize UUID fields
        const updateData = { ...body };
        if (updateData.category_id === '') updateData.category_id = null;
        if (updateData.artist_id === '') updateData.artist_id = null;

        const { data: design, error } = await supabase
            .from('tattoo_designs')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(design);
    } catch (error) {
        console.error('Error updating tattoo design:', error);
        return NextResponse.json(
            { error: 'Failed to update design' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/tattoos/[id] - Delete tattoo design
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { id } = await params;

        const { error } = await supabase
            .from('tattoo_designs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tattoo design:', error);
        return NextResponse.json(
            { error: 'Failed to delete design' },
            { status: 500 }
        );
    }
}
