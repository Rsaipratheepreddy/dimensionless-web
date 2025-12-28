import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';

// GET /api/admin/categories - Get all categories (admin)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('type, name');

        console.log('Categories query result:', {
            categoriesCount: categories?.length || 0,
            error: error?.message,
            errorDetails: error
        });

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json(categories || []);
    } catch (error: any) {
        console.error('Error fetching categories (catch):', error);
        return NextResponse.json([]);
    }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const body = await request.json();

        const { data: category, error } = await supabase
            .from('categories')
            .insert([{
                name: body.name,
                type: body.type,
                description: body.description,
                color: body.color || '#8b5cf6',
                is_active: body.is_active ?? true
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
