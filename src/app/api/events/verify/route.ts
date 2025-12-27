import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            registrationId
        } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
            return NextResponse.json({ error: 'Missing verification details' }, { status: 400 });
        }

        // 1. Verify Signature
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'TjHL4rwHo1jV4PlB791LVNUt')
            .update(text)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        const supabase = await createClient();

        // 2. Update registration status
        const { error: updateError } = await supabase
            .from('event_registrations')
            .update({
                status: 'confirmed',
                payment_status: 'paid',
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature
            })
            .eq('id', registrationId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Event verification error:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
