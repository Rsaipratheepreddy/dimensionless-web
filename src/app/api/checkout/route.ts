import { NextResponse } from 'next/server';
import { razorpay } from '@/utils/razorpay';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: Request) {
    try {
        const { paintingId, amount } = await req.json();

        // Optional: Check if painting exists/available from Supabase
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('paintings')
            .select('id, price')
            .eq('id', paintingId)
            .single();

        if (error || !data) {
            console.error('Painting not found for checkout:', paintingId);
        }

        // Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: paintingId.slice(0, 40),
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error: any) {
        console.error('Checkout error detail:', {
            message: error.message,
            stack: error.stack,
            error: error
        });
        return NextResponse.json({
            error: 'Failed to create order',
            details: error.message
        }, { status: 500 });
    }
}

