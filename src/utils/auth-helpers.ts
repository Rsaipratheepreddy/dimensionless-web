/**
 * Constructs a consistent URL for authentication redirects.
 * Prioritizes environment variables but falls back to window.location.origin in the browser.
 */
export const getURL = (path: string = '') => {
    let url =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        (typeof window !== 'undefined' ? window.location.origin : '');

    // Ensure it starts with http/https
    if (url && !url.includes('http')) {
        url = `https://${url}`;
    }

    // Fallback if still empty (should only happen on server with no env vars)
    if (!url) {
        url = 'http://localhost:3000';
    }

    // Ensure no trailing slash on base URL
    url = url.endsWith('/') ? url.slice(0, -1) : url;

    // Concat path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${url}${cleanPath}`;
};
