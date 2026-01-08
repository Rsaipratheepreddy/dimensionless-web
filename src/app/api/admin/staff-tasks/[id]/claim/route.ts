import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Claim the task: Update assigned_to to the current user
    const { data, error } = await supabase
        .from('staff_tasks')
        .update({
            assigned_to: user.id,
            status: 'in-progress'
        })
        .eq('id', id)
        .is('assigned_to', null) // Only claim if still unassigned
        .select()
        .single();

    if (error) {
        console.error('Error claiming task:', error);
        return NextResponse.json({ error: 'Failed to claim task or task already assigned' }, { status: 400 });
    }

    return NextResponse.json(data);
}
