import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helpful diagnostic log (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Supabase Initializing with URL:', supabaseUrl?.substring(0, 20) + '...');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
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
});

export const createClient = () => supabase;
