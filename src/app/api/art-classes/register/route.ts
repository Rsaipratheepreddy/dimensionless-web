import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/art-classes/register - Create a new registration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { classId } = body;

        if (!classId) {
            return NextResponse.json({ error: 'Missing class ID' }, { status: 400 });
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

        // 1. Get user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch class info
        const { data: artClass, error: classError } = await supabase
            .from('art_classes')
            .select('*')
            .eq('id', classId)
            .single();

        if (classError || !artClass) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // 3. Prevent duplicate registration
        const { data: existing } = await supabase
            .from('art_class_registrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('class_id', classId)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already registered' }, { status: 400 });
        }

        // 4. Handle based on pricing type
        if (artClass.pricing_type === 'free') {
            // Instant active registration
            const { data: reg, error: regError } = await supabase
                .from('art_class_registrations')
                .insert([{
                    user_id: user.id,
                    class_id: classId,
                    type: 'free',
                    status: 'active'
                }])
                .select()
                .single();

            if (regError) throw regError;
            return NextResponse.json(reg, { status: 201 });
        }

        // If paid, this endpoint might just trigger the registration in 'pending' status
        // and return the info needed for Razorpay checkout.
        const { data: pendingReg, error: pError } = await supabase
            .from('art_class_registrations')
            .insert([{
                user_id: user.id,
                class_id: classId,
                type: artClass.pricing_type,
                amount_paid: artClass.price,
                status: 'pending'
            }])
            .select()
            .single();

        if (pError) throw pError;

        // Return registration info for the frontend to proceed with payment
        return NextResponse.json({
            registrationId: pendingReg.id,
            price: artClass.price,
            pricing_type: artClass.pricing_type,
            subscription_duration: artClass.subscription_duration
        }, { status: 200 });

    } catch (error) {
        console.error('Error registering for class:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
