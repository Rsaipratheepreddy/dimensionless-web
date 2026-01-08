import { createBrowserClient } from '@supabase/ssr';

// Use environment variables with fallbacks to prevent build-time crashes
// during static generation/prerendering when env vars might be missing.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Helpful diagnostic log
if (process.env.NODE_ENV === 'development') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase environment variables are missing. Some features may not work.');
    } else {
        console.log('🔌 Supabase Initializing with URL:', supabaseUrl.substring(0, 20) + '...');
    }
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
