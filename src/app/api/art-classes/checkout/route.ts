import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/utils/razorpay';
import { createClient } from '@/utils/supabase-server';

// POST /api/art-classes/checkout - Create Razorpay order for class registration
export async function POST(req: NextRequest) {
    try {
        const { registrationId, amount } = await req.json();

        if (!registrationId || !amount) {
            return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check for admin role or simply if user exists (already checked in register, but good to be safe)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `art_reg_${registrationId.slice(0, 20)}`,
        };

        const order = await razorpay.orders.create(options);

        // Update registration with order ID
        await supabase
            .from('art_class_registrations')
            .update({ razorpay_order_id: order.id })
            .eq('id', registrationId)
            .eq('user_id', user.id); // Security: ensure user owns registration

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error: any) {
        console.error('Art class checkout error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
