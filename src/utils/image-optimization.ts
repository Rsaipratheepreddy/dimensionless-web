/**
 * Image optimization utilities for the project.
 * Focuses on Supabase storage transformations and client-side optimizations.
 */

interface SupabaseImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'origin';
    resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Generates a Supabase Transformation URL for an image.
 * Requires Supabase Image Transformation to be enabled (Pro plan).
 */
export function getOptimizedImageUrl(url: string, options: SupabaseImageOptions = {}) {
    if (!url) return '';

    // If it's not a Supabase storage URL, return as is
    if (!url.includes('supabase.co/storage/v1/object/public/')) {
        return url;
    }

    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());

    // Default to webp if not specified (best for performance)
    params.append('format', options.format || 'webp');

    if (options.resize) params.append('resize', options.resize);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
}

/**
 * Placeholder for client-side WebP conversion.
 * In a real scenario, you'd use a library like 'browser-image-compression'
 */
export async function convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('WebP conversion failed'));
                }, 'image/webp', 0.8);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
