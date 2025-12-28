import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/tattoos/[designId]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ designId: string }> }
) {
    try {
        const supabase = await createClient();

        const { designId } = await params;

        const { data: design, error } = await supabase
            .from('tattoo_designs')
            .select('*')
            .eq('id', designId)
            .single();

        if (error) throw error;

        return NextResponse.json(design);
    } catch (error) {
        console.error('Error fetching design:', error);
        return NextResponse.json(
            { error: 'Failed to fetch design' },
            { status: 500 }
        );
    }
}
