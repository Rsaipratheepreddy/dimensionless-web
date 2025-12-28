import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paintingId,
            buyerId,
            bookingId
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
        const supabase = await createClient();

        let artistId;
        let price;

        if (bookingId) {
            // Handle Tattoo Booking
            const { data: booking, error: bookingError } = await supabase
                .from('tattoo_bookings')
                .select(`
                    final_price,
                    tattoo_designs (
                        artist_id
                    )
                `)
                .eq('id', bookingId)
                .single();

            if (bookingError || !booking) {
                console.error('Fetch booking error:', bookingError);
                throw new Error('Could not find booking details');
            }

            // @ts-ignore - tattoo_designs is an object because of the select
            artistId = booking.tattoo_designs.artist_id;
            price = booking.final_price;

            // Update booking status
            await supabase
                .from('tattoo_bookings')
                .update({
                    payment_status: 'completed',
                    payment_id: razorpay_payment_id,
                    status: 'confirmed'
                })
                .eq('id', bookingId);

        } else {
            // Handle Painting Purchase
            const { data: painting, error: fetchError } = await supabase
                .from('paintings')
                .select('artist_id, price')
                .eq('id', paintingId)
                .single();

            if (fetchError || !painting) {
                console.error('Fetch painting error:', fetchError);
                throw new Error('Could not find artwork details');
            }

            artistId = painting.artist_id;
            price = painting.price;

            // Mark painting as sold
            await supabase
                .from('paintings')
                .update({ status: 'sold' })
                .eq('id', paintingId);

            // Create order record
            await supabase
                .from('orders')
                .insert([{
                    buyer_id: buyerId,
                    painting_id: paintingId,
                    amount: price,
                    razorpay_order_id,
                    razorpay_payment_id,
                    status: 'completed'
                }]);
        }

        // Common: Update artist wallet
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('platform_fee_percent')
            .single();

        const platformFeePercent = settings?.platform_fee_percent ?? 10;
        const platformFeeMultiplier = platformFeePercent / 100;

        const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', artistId)
            .single();

        const artistEarnings = price * (1 - platformFeeMultiplier);

        const { error: walletError } = await supabase
            .from('profiles')
            .update({ wallet_balance: (profile?.wallet_balance || 0) + artistEarnings })
            .eq('id', artistId);

        if (walletError) {
            console.error('Update wallet error:', walletError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}

