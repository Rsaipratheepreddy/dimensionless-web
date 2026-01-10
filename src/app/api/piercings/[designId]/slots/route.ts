import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/piercings/[designId]/slots?date=YYYY-MM-DD
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        const supabase = await createClient();

        let query = supabase
            .from('piercing_slots')
            .select('*')
            .order('start_time');

        if (date) {
            query = query.eq('date', date);
        }

        const { data: slots, error } = await query;
        if (error) throw error;

        // Fallback: If no slots are configured, provide default slots (10 AM - 10 PM)
        if (!slots || slots.length === 0) {
            const defaultSlots = [];
            const day = date || new Date().toISOString().split('T')[0];

            // From 10:00 to 22:00 (10 PM)
            for (let hour = 10; hour < 22; hour++) {
                const startTime = `${hour.toString().padStart(2, '0')}:00`;
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

                defaultSlots.push({
                    id: `default-${day}-${startTime}`,
                    date: day,
                    start_time: startTime,
                    end_time: endTime,
                    is_available: true,
                    current_bookings: 0,
                    max_bookings: 1
                });
            }
            return NextResponse.json(defaultSlots);
        }

        return NextResponse.json(slots || []);
    } catch (error) {
        console.error('Error fetching slots:', error);
        return NextResponse.json(
            { error: 'Failed to fetch slots' },
            { status: 500 }
        );
    }
}
