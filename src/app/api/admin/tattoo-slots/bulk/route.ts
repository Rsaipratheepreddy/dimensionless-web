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

// POST /api/admin/tattoo-slots/bulk - Create multiple slots at once
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const verification = await verifyAdmin(supabase);
        if ('error' in verification) {
            return NextResponse.json({ error: verification.error }, { status: verification.status });
        }
        const { user } = verification;

        const body = await request.json();
        const { date, start_time, end_time, slot_duration, max_bookings } = body;

        // Parse times
        const [startHour, startMin] = start_time.split(':').map(Number);
        const [endHour, endMin] = end_time.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const durationMinutes = parseInt(slot_duration);

        // Generate slots
        const slots = [];
        for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += durationMinutes) {
            const slotStartHour = Math.floor(currentMinutes / 60);
            const slotStartMin = currentMinutes % 60;
            const slotEndMinutes = currentMinutes + durationMinutes;
            const slotEndHour = Math.floor(slotEndMinutes / 60);
            const slotEndMin = slotEndMinutes % 60;

            const slotStartTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
            const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

            slots.push({
                date,
                start_time: slotStartTime,
                end_time: slotEndTime,
                max_bookings: parseInt(max_bookings),
                current_bookings: 0,
                is_available: true,
                created_by: user!.id
            });
        }

        // Insert all slots
        const { data, error } = await supabase
            .from('tattoo_slots')
            .insert(slots)
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            count: slots.length,
            slots: data
        });
    } catch (error) {
        console.error('Error creating bulk slots:', error);
        return NextResponse.json(
            { error: 'Failed to create slots' },
            { status: 500 }
        );
    }
}
