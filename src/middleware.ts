import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If env vars aren't loaded yet (can happen in some dev environments), just skip middleware
    if (!supabaseUrl || !supabaseAnonKey) {
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const host = request.headers.get('host') || '';
    const { pathname } = request.nextUrl

    // Detect admin subdomain
    const isAdminSubdomain = host.startsWith('admin.');

    // Only protect admin routes or subdomain routes
    const protectedRoutes = ['/admin', '/employee']
    let isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    // If on admin subdomain, it's inherently a protected path eventually
    if (isAdminSubdomain) {
        isProtectedRoute = true;
    }

    let user = null;
    if (isProtectedRoute) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser;
    }

    // Redirect to home if accessing protected routes while logged out
    if (!user && isProtectedRoute) {
        // If on admin subdomain, redirect to the main domain home page
        if (isAdminSubdomain) {
            const mainUrl = new URL(request.url)
            mainUrl.hostname = host.replace('admin.', '')
            mainUrl.pathname = '/'
            return NextResponse.redirect(mainUrl)
        }

        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Rewrite logic for subdomain
    if (isAdminSubdomain && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
        const url = request.nextUrl.clone();
        url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
