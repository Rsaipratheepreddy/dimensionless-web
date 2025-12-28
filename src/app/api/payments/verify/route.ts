import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';
import crypto from 'crypto';

// POST /api/payments/verify
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Update booking in database
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('tattoo_bookings')
            .update({
                payment_status: 'completed',
                payment_id: razorpay_payment_id,
                status: 'confirmed'
            })
            .eq('id', booking_id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            booking: data
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
