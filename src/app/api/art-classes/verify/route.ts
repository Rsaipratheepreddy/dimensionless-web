import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/art-classes/verify - Verify Razorpay payment and activate registration
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

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // 2. Fetch registration details
        const { data: registration, error: regError } = await supabase
            .from('art_class_registrations')
            .select(`
                *,
                art_classes (
                    title,
                    price,
                    subscription_duration
                )
            `)
            .eq('id', registrationId)
            .single();

        if (regError || !registration) {
            throw new Error('Registration not found');
        }

        // 3. Update registration status
        const updateData: any = {
            status: 'active',
            razorpay_payment_id: razorpay_payment_id,
            amount_paid: registration.amount_paid
        };

        // If it was a subscription, calculate expiry
        if (registration.type === 'subscription' && registration.art_classes.subscription_duration) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + registration.art_classes.subscription_duration);
            updateData.expires_at = expiry.toISOString();
        }

        const { error: updateError } = await supabase
            .from('art_class_registrations')
            .update(updateData)
            .eq('id', registrationId);

        if (updateError) throw updateError;

        // 4. Record attendance/history if needed (optional for now)

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Art class verification error:', error);
        return NextResponse.json({ error: 'Payment verification failed', details: error.message }, { status: 500 });
    }
}
