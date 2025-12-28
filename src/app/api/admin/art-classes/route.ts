import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/admin/art-classes - Fetch all classes for admin
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch classes with registration count
        const { data: classes, error } = await supabase
            .from('art_classes')
            .select(`
                *,
                registrations:art_class_registrations(count)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching admin classes:', error);
            return NextResponse.json([]);
        }

        // Map registrations count back to _count format used in frontend
        const formattedClasses = (classes || []).map(c => ({
            ...c,
            _count: {
                registrations: Array.isArray(c.registrations) ? (c.registrations[0] as any).count : 0
            }
        }));

        return NextResponse.json(formattedClasses);
    } catch (error: any) {
        console.error('Error fetching admin classes:', error);
        return NextResponse.json([]);
    }
}

// DELETE /api/admin/art-classes?id=UUID
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing class ID' }, { status: 400 });
        }

        const supabase = await createClient();

        // Verify admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Delete associated registrations
        const { error: regError } = await supabase
            .from('art_class_registrations')
            .delete()
            .eq('class_id', id);

        if (regError) {
            console.error('Error deleting class registrations:', regError);
            throw regError;
        }

        // 2. Delete class (sessions will be deleted via CASCADE in DB)
        const { error: classError } = await supabase
            .from('art_classes')
            .delete()
            .eq('id', id);

        if (classError) throw classError;

        return NextResponse.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/art-classes - Create new class
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessions, ...classData } = body;

        const supabase = await createClient();

        // Verify admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Create Class
        const finalClassData = {
            ...classData,
            category_id: classData.category_id || null
        };

        const { data: newClass, error: classError } = await supabase
            .from('art_classes')
            .insert([finalClassData])
            .select()
            .single();

        if (classError) throw classError;

        // 2. Create Sessions
        if (sessions && sessions.length > 0) {
            const sessionsWithClassId = sessions.map((s: any) => ({
                ...s,
                class_id: newClass.id
            }));

            const { error: sessionError } = await supabase
                .from('art_class_sessions')
                .insert(sessionsWithClassId);

            if (sessionError) throw sessionError;
        }

        return NextResponse.json(newClass, { status: 201 });
    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
