import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// DELETE /api/admin/tattoo-slots/[id] - Delete slot
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

        // Check if slot has any bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from('tattoo_bookings')
            .select('id')
            .eq('slot_id', id);

        if (bookingsError) throw bookingsError;

        if (bookings && bookings.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete slot with existing bookings',
                    message: `This slot has ${bookings.length} booking(s). Please cancel or reassign the bookings first.`,
                    bookingCount: bookings.length
                },
                { status: 400 }
            );
        }

        // Delete slot if no bookings
        const { error } = await supabase
            .from('tattoo_slots')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting slot:', error);
        return NextResponse.json(
            { error: 'Failed to delete slot' },
            { status: 500 }
        );
    }
}
