import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount, durationMonths, multiplier } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const bonusAmount = amount * (multiplier - 1);
        const unlockDate = new Date();
        unlockDate.setMonth(unlockDate.getMonth() + durationMonths);

        const { data: lock, error } = await supabase
            .from('token_locks')
            .insert([{
                user_id: user.id,
                amount: amount,
                duration_months: durationMonths,
                multiplier: multiplier,
                bonus_amount: bonusAmount,
                unlock_date: unlockDate.toISOString(),
                status: 'active'
            }])
            .select()
            .single();

        if (error) {
            console.error('Lock creation error:', error);
            return NextResponse.json({ error: 'Failed to initiate stake' }, { status: 500 });
        }

        // 3. Log Activity
        await supabase
            .from('token_activity')
            .insert([{
                user_id: user.id,
                type: 'lock_initiated',
                amount: amount,
                description: `Locked ${amount.toLocaleString()} $DIMEN for ${durationMonths} months`,
                metadata: { lock_id: lock.id, multiplier: multiplier }
            }]);

        return NextResponse.json({ success: true, lock });

    } catch (error) {
        console.error('Stake initiation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
