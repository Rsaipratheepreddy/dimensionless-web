import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/utils/razorpay';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount } = await req.json();

        if (!amount || amount < 500) {
            return NextResponse.json({ error: 'Invalid amount. Minimum ₹500 required.' }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `token_contribution_${Date.now()}`,
            notes: {
                user_id: user.id,
                type: 'token_contribution'
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error('Token checkout error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
