import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// POST /api/art-classes/register - Create a new registration
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { classId } = body;

        if (!classId) {
            return NextResponse.json({ error: 'Missing class ID' }, { status: 400 });
        }

        const supabase = await createClient();

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
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: 'Already registered' }, { status: 400 });
        }

        // 4. Handle based on pricing type
        if (artClass.pricing_type === 'free') {
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

        // If paid, create pending registration
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
