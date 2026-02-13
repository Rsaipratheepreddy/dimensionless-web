/**
 * Utility for proxying requests to the AWS NestJS backend.
 * All Next.js API routes use this instead of Supabase.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Fetch from the NestJS backend with timeout and error handling.
 */
export async function backendFetch(
    path: string,
    options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
    if (!BACKEND_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

    const url = `${BACKEND_URL}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout: ${path}`);
        }
        throw error;
    }
}

/**
 * GET JSON from backend
 */
export async function backendGet(path: string, headers?: HeadersInit) {
    const res = await backendFetch(path, { method: 'GET', headers });
    return res;
}

/**
 * POST JSON to backend
 */
export async function backendPost(path: string, body: any, headers?: HeadersInit) {
    const res = await backendFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });
    return res;
}

/**
 * PUT JSON to backend
 */
export async function backendPut(path: string, body: any, headers?: HeadersInit) {
    const res = await backendFetch(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });
    return res;
}

/**
 * PATCH JSON to backend
 */
export async function backendPatch(path: string, body: any, headers?: HeadersInit) {
    const res = await backendFetch(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });
    return res;
}

/**
 * DELETE from backend
 */
export async function backendDelete(path: string, headers?: HeadersInit) {
    const res = await backendFetch(path, { method: 'DELETE', headers });
    return res;
}

/**
 * Forward cookies/auth headers from the incoming request to the backend.
 * This preserves authentication context.
 */
export function forwardHeaders(request: Request): HeadersInit {
    const headers: HeadersInit = {};
    const cookie = request.headers.get('cookie');
    if (cookie) headers['Cookie'] = cookie;
    const auth = request.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;
    return headers;
}

/**
 * Proxy a full request to the backend, forwarding method, body, and auth headers.
 * Returns a NextResponse-compatible Response.
 */
export async function proxyToBackend(
    request: Request,
    backendPath: string
): Promise<Response> {
    const headers = forwardHeaders(request);
    const method = request.method;

    const fetchOptions: RequestInit = {
        method,
        headers: { ...headers },
    };

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await request.json();
            (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            fetchOptions.body = formData;
        } else {
            const body = await request.text();
            (fetchOptions.headers as Record<string, string>)['Content-Type'] = contentType;
            fetchOptions.body = body;
        }
    }

    return backendFetch(backendPath, fetchOptions);
}
