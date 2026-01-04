import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Fetch artwork with all related data
        const { data: artwork, error } = await supabase
            .from('artworks')
            .select(`
                *,
                artist:profiles!artist_id(
                    id,
                    full_name,
                    avatar_url,
                    shop_name,
                    shop_description
                ),
                images:artwork_images(
                    id,
                    image_url,
                    display_order,
                    is_primary,
                    caption
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Artwork not found' },
                    { status: 404 }
                );
            }
            console.error('Error fetching artwork:', error);
            return NextResponse.json(
                { error: 'Failed to fetch artwork' },
                { status: 500 }
            );
        }

        // Sort images by display_order
        if (artwork.images) {
            artwork.images.sort((a: any, b: any) => a.display_order - b.display_order);
        }

        return NextResponse.json({
            artwork
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user owns this artwork or is admin
        const { data: artwork } = await supabase
            .from('artworks')
            .select('artist_id')
            .eq('id', id)
            .single();

        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            );
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isOwner = artwork.artist_id === user.id;
        const isAdmin = profile?.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden: You can only update your own artworks' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            about,
            purchase_price,
            lease_monthly_rate,
            lease_security_deposit,
            medium,
            dimensions,
            year_created,
            category,
            tags,
            status,
            is_featured
        } = body;

        // Update artwork
        const { data: updatedArtwork, error: updateError } = await supabase
            .from('artworks')
            .update({
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(about !== undefined && { about }),
                ...(purchase_price !== undefined && { purchase_price }),
                ...(lease_monthly_rate !== undefined && { lease_monthly_rate }),
                ...(lease_security_deposit !== undefined && { lease_security_deposit }),
                ...(medium !== undefined && { medium }),
                ...(dimensions !== undefined && { dimensions }),
                ...(year_created !== undefined && { year_created }),
                ...(category !== undefined && { category }),
                ...(tags !== undefined && { tags }),
                ...(status !== undefined && { status }),
                ...(is_featured !== undefined && { is_featured }),
                ...(status === 'published' && { published_at: new Date().toISOString() })
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating artwork:', updateError);
            return NextResponse.json(
                { error: 'Failed to update artwork' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            artwork: updatedArtwork,
            message: 'Artwork updated successfully'
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user owns this artwork or is admin
        const { data: artwork } = await supabase
            .from('artworks')
            .select('artist_id')
            .eq('id', id)
            .single();

        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            );
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isOwner = artwork.artist_id === user.id;
        const isAdmin = profile?.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden: You can only delete your own artworks' },
                { status: 403 }
            );
        }

        // Delete artwork (images will be cascade deleted)
        const { error: deleteError } = await supabase
            .from('artworks')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting artwork:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete artwork' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Artwork deleted successfully'
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
