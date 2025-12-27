import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/utils/razorpay';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const { registrationId, amount } = await req.json();

        if (!registrationId || !amount) {
            return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
        }

        const supabase = await createClient();

        // Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `ev_reg_${registrationId.slice(0, 20)}`,
        };

        const order = await razorpay.orders.create(options);

        // Update registration with order ID
        await supabase
            .from('event_registrations')
            .update({ razorpay_order_id: order.id })
            .eq('id', registrationId);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error: any) {
        console.error('Event checkout error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
