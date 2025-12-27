import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/utils/razorpay';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/art-classes/checkout - Create Razorpay order for class registration
export async function POST(req: NextRequest) {
    try {
        const { registrationId, amount } = await req.json();

        if (!registrationId || !amount) {
            return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
        }

        // Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `art_reg_${registrationId.slice(0, 20)}`,
        };

        const order = await razorpay.orders.create(options);

        // Update registration with order ID
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

        await supabase
            .from('art_class_registrations')
            .update({ razorpay_order_id: order.id })
            .eq('id', registrationId);

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
