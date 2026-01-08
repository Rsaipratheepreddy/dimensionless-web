import { createClient } from '@/utils/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');

    let query = supabase
        .from('staff_tasks')
        .select(`
            *,
            assigned_profile:profiles!staff_tasks_assigned_to_fkey(full_name, email),
            creator_profile:profiles!staff_tasks_created_by_fkey(full_name, email)
        `);

    if (assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
    } else if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
    }

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
        .from('staff_tasks')
        .insert([{
            ...body,
            created_by: body.created_by || user.id // Default to current user if not specified
        }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
