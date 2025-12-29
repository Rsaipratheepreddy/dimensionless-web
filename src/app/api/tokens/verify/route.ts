import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amountInr,
            tokenAmount
        } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // 2. Record in Database
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: contribution, error } = await supabase
            .from('token_investments')
            .insert([{
                user_id: user.id,
                amount_inr: amountInr,
                token_amount: tokenAmount,
                razorpay_payment_id: razorpay_payment_id,
                razorpay_order_id: razorpay_order_id,
                status: 'completed'
            }])
            .select()
            .single();

        if (error) {
            console.error('Record contribution error:', error);
            return NextResponse.json({ error: 'Failed to record contribution' }, { status: 500 });
        }

        // 3. Update Token Stats (Optional but good)
        // We could increment the raised_amount and investors_count here but it might be better handled by a trigger
        // For now, we rely on the manual admin update or a scheduled job

        return NextResponse.json({
            success: true,
            investmentId: contribution.id
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
