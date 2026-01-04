import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
                { error: 'Forbidden: Only creators and admins can upload artwork images' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const artworkId = formData.get('artwork_id') as string;

        if (!artworkId) {
            return NextResponse.json(
                { error: 'artwork_id is required' },
                { status: 400 }
            );
        }

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Verify user owns this artwork
        const { data: artwork } = await supabase
            .from('artworks')
            .select('artist_id')
            .eq('id', artworkId)
            .single();

        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            );
        }

        const isOwner = artwork.artist_id === user.id;
        const isAdmin = profile.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden: You can only upload images to your own artworks' },
                { status: 403 }
            );
        }

        const uploadedImages = [];

        // Get current max display_order
        const { data: existingImages } = await supabase
            .from('artwork_images')
            .select('display_order')
            .eq('artwork_id', artworkId)
            .order('display_order', { ascending: false })
            .limit(1);

        let nextDisplayOrder = existingImages && existingImages.length > 0
            ? existingImages[0].display_order + 1
            : 0;

        // Upload each file
        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${artworkId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('artworks')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                continue;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('artworks')
                .getPublicUrl(fileName);

            // Create image record
            const { data: imageRecord, error: imageError } = await supabase
                .from('artwork_images')
                .insert({
                    artwork_id: artworkId,
                    image_url: publicUrl,
                    display_order: nextDisplayOrder,
                    is_primary: nextDisplayOrder === 0
                })
                .select()
                .single();

            if (imageError) {
                console.error('Error creating image record:', imageError);
                continue;
            }

            uploadedImages.push(imageRecord);
            nextDisplayOrder++;
        }

        return NextResponse.json({
            images: uploadedImages,
            message: `Successfully uploaded ${uploadedImages.length} image(s)`
        }, { status: 201 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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

        const { searchParams } = request.nextUrl;
        const imageId = searchParams.get('id');

        if (!imageId) {
            return NextResponse.json(
                { error: 'image_id is required' },
                { status: 400 }
            );
        }

        // Get image and verify ownership
        const { data: image } = await supabase
            .from('artwork_images')
            .select(`
                *,
                artwork:artworks!artwork_id(artist_id)
            `)
            .eq('id', imageId)
            .single();

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isOwner = image.artwork.artist_id === user.id;
        const isAdmin = profile?.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Delete from storage
        const urlParts = image.image_url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // Get last two parts (folder/filename)

        await supabase.storage
            .from('artworks')
            .remove([fileName]);

        // Delete record
        const { error: deleteError } = await supabase
            .from('artwork_images')
            .delete()
            .eq('id', imageId);

        if (deleteError) {
            console.error('Error deleting image:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete image' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
