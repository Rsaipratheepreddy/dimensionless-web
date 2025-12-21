import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paintingId,
            buyerId
        } = await req.json();

        // Verify Signature
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'TjHL4rwHo1jV4PlB791LVNUt')
            .update(text)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Initialize Supabase
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

        // 1. Fetch painting details for price and artist
        const { data: painting, error: fetchError } = await supabase
            .from('paintings')
            .select('artist_id, price')
            .eq('id', paintingId)
            .single();

        if (fetchError || !painting) {
            console.error('Fetch painting error:', fetchError);
            throw new Error('Could not find artwork details');
        }

        // 2. Mark painting as sold
        const { error: paintingError } = await supabase
            .from('paintings')
            .update({ status: 'sold' })
            .eq('id', paintingId);

        if (paintingError) {
            console.error('Update status error:', paintingError);
            throw paintingError;
        }

        // 3. Create order record with REAL amount
        const { error: orderError } = await supabase
            .from('orders')
            .insert([{
                buyer_id: buyerId,
                painting_id: paintingId,
                amount: painting.price,
                razorpay_order_id,
                razorpay_payment_id,
                status: 'completed'
            }]);

        if (orderError) {
            console.error('Create order error:', orderError);
            throw orderError;
        }

        // 4. Update artist wallet
        // NEW: Fetch configurable platform fee
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('platform_fee_percent')
            .single();

        const platformFeePercent = settings?.platform_fee_percent ?? 10; // Default to 10%
        const platformFeeMultiplier = platformFeePercent / 100;

        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', painting.artist_id)
            .single();

        const artistEarnings = painting.price * (1 - platformFeeMultiplier);

        const { error: walletError } = await supabase
            .from('profiles')
            .update({ wallet_balance: (profile?.wallet_balance || 0) + artistEarnings })
            .eq('id', painting.artist_id);

        if (walletError) {
            console.error('Update wallet error:', walletError);
            // We don't throw here to avoid failing whole payment if just wallet update fails (can be synced later)
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}

