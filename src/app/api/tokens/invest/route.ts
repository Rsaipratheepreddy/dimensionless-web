import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amountInr, tokenAmount } = body;

        if (!amountInr || !tokenAmount) {
            return NextResponse.json({ error: 'Missing investment details' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Record investment (initially pending)
        const { data: investment, error: invError } = await supabase
            .from('token_investments')
            .insert([{
                user_id: user.id,
                amount_inr: amountInr,
                token_amount: tokenAmount,
                status: 'completed' // For now, we simulate success directly
            }])
            .select()
            .single();

        if (invError) {
            console.error('Error recording investment:', invError);
            return NextResponse.json({ error: 'Failed to record investment' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            investmentId: investment.id
        });

    } catch (error) {
        console.error('Token investment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
