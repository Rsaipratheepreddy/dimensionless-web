import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/admin/art-classes/[id] - Fetch single class with sessions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
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

        // Fetch class and sessions
        const { data: artClass, error: classError } = await supabase
            .from('art_classes')
            .select(`
                *,
                sessions:art_class_sessions(*)
            `)
            .eq('id', id)
            .single();

        if (classError) throw classError;

        return NextResponse.json(artClass);
    } catch (error) {
        console.error('Error fetching class details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT /api/admin/art-classes/[id] - Update class and sessions
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { sessions, id: _id, created_at, updated_at, ...updateData } = body;

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

        // 1. Update Class
        const finalUpdateData = {
            ...updateData,
            category_id: updateData.category_id || null
        };

        const { error: classError } = await supabase
            .from('art_classes')
            .update(finalUpdateData)
            .eq('id', id);

        if (classError) throw classError;

        // 2. Update Sessions (Delete existing and insert new for simplicity, or do complex sync)
        // For now, simpler: delete all for this class and re-insert
        await supabase.from('art_class_sessions').delete().eq('class_id', id);

        if (sessions && sessions.length > 0) {
            const sessionsWithClassId = sessions.map((s: any) => {
                const { id: _, created_at: __, ...sData } = s;
                return {
                    ...sData,
                    class_id: id
                };
            });

            const { error: sessionError } = await supabase
                .from('art_class_sessions')
                .insert(sessionsWithClassId);

            if (sessionError) throw sessionError;
        }

        return NextResponse.json({ message: 'Class updated successfully' });
    } catch (error) {
        console.error('Error updating class:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
