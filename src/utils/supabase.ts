import { createBrowserClient } from '@supabase/ssr';

// We use a Proxy to lazily initialize the Supabase client.
// This allows the build process to complete even if environment variables are missing,
// without baking placeholder URLs into the client bundle.
const createLazySupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // If we're on the server during build, we can return a dummy.
        // If we're on the client at runtime, this will eventually fail, 
        // which is correct if the configuration is missing.
        if (typeof window === 'undefined') {
            return {} as any;
        }
    }

    return createBrowserClient(
        supabaseUrl || 'https://missing-url.supabase.co',
        supabaseAnonKey || 'missing-key',
        {
            global: {
                fetch: (...args) => {
                    const start = Date.now();
                    return fetch(...args).then(res => {
                        const duration = Date.now() - start;
                        if (duration > 5000 || res.status >= 400) {
                            console.log(`📡 Supabase Request: ${args[0]} | Status: ${res.status} | Duration: ${duration}ms`);
                        }
                        return res;
                    });
                }
            }
        }
    );
};

let internalSupabase: any;

export const supabase = new Proxy({} as any, {
    get(_, prop) {
        if (!internalSupabase) {
            internalSupabase = createLazySupabaseClient();
        }
        return internalSupabase[prop];
    }
});

export const createClient = () => supabase;
