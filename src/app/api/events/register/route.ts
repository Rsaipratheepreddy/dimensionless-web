import { createClient } from '@/utils/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { eventId, inviteCode } = await request.json();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get Event Details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 2. Check Capacity
        if (event.max_capacity) {
            const { count } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', eventId)
                .eq('status', 'confirmed');

            if (count && count >= event.max_capacity) {
                return NextResponse.json({ error: 'Event is full' }, { status: 400 });
            }
        }

        // 3. Handle Registration
        if (event.price === 0) {
            // Free Registration
            const { data, error } = await supabase
                .from('event_registrations')
                .upsert([{
                    event_id: eventId,
                    user_id: user.id,
                    status: 'confirmed',
                    payment_status: 'paid', // Free is technically "paid"
                    invite_code: inviteCode
                }])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, registration: data });
        } else {
            // Paid Registration - Create pending record
            const { data, error } = await supabase
                .from('event_registrations')
                .upsert([{
                    event_id: eventId,
                    user_id: user.id,
                    status: 'pending',
                    payment_status: 'unpaid',
                    invite_code: inviteCode
                }])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({
                success: true,
                registrationId: data.id,
                price: event.price,
                needsPayment: true
            });
        }

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
