import { createClient } from '@/utils/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds with Supabase Pro

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        // Query parameters
        const type = searchParams.get('type'); // 'purchase', 'lease', or 'all'
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const artistId = searchParams.get('artist_id');

        // Build query with Supabase Pro prepared statement optimization
        let query = supabase
            .from('artworks')
            .select(`
                *,
                artist:profiles!artist_id(
                    id,
                    full_name,
                    avatar_url
                ),
                images:artwork_images(
                    id,
                    image_url,
                    display_order,
                    is_primary,
                    caption
                )
            `, { count: 'exact' })
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        // Filter by type
        if (type === 'purchase') {
            query = query.not('purchase_price', 'is', null);
        } else if (type === 'lease') {
            query = query.not('lease_monthly_rate', 'is', null);
        }

        // Filter by category
        if (category) {
            query = query.eq('category', category);
        }

        // Filter by featured
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        // Filter by artist
        if (artistId) {
            query = query.eq('artist_id', artistId);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: artworks, error, count } = await query;

        if (error) {
            console.error('Error fetching artworks:', error);
            return NextResponse.json(
                { error: 'Failed to fetch artworks' },
                { status: 500 }
            );
        }

        // Sort images by display_order
        const processedArtworks = artworks?.map((artwork: any) => ({
            ...artwork,
            images: artwork.images?.sort((a: any, b: any) => a.display_order - b.display_order) || []
        }));

        return NextResponse.json({
            artworks: processedArtworks,
            total: count,
            limit,
            offset
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user has creator or admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['creator', 'admin'].includes(profile.role)) {
            return NextResponse.json(
                { error: 'Forbidden: Only creators and admins can create artworks' },
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
            stock_quantity,
            origin,
            design_style,
            delivery_info,
            variants,
            allow_purchase,
            allow_lease,
            images = []
        } = body;

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Get artist name from profile
        const { data: artistProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        // Create artwork
        const { data: artwork, error: artworkError } = await supabase
            .from('artworks')
            .insert({
                title,
                description,
                about,
                artist_id: user.id,
                artist_name: artistProfile?.full_name || 'Unknown Artist',
                purchase_price,
                lease_monthly_rate,
                lease_security_deposit,
                medium,
                dimensions,
                year_created,
                category,
                tags,
                stock_quantity: stock_quantity || 1,
                origin,
                design_style,
                delivery_info,
                variants: variants || [],
                allow_purchase: allow_purchase !== undefined ? allow_purchase : true,
                allow_lease: allow_lease !== undefined ? allow_lease : false,
                status: 'draft'
            })
            .select()
            .single();

        if (artworkError) {
            console.error('Error creating artwork:', artworkError);
            return NextResponse.json(
                { error: 'Failed to create artwork' },
                { status: 500 }
            );
        }

        // Create artwork images if provided
        if (images.length > 0) {
            const imageRecords = images.map((img: any, index: number) => ({
                artwork_id: artwork.id,
                image_url: img.url,
                display_order: img.display_order || index,
                is_primary: img.is_primary || index === 0,
                caption: img.caption
            }));

            const { error: imagesError } = await supabase
                .from('artwork_images')
                .insert(imageRecords);

            if (imagesError) {
                console.error('Error creating images:', imagesError);
                // Don't fail the request, just log the error
            }
        }

        return NextResponse.json({
            artwork,
            message: 'Artwork created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
