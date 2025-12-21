import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not configured. Please add the following to your .env.local file:\nNEXT_PUBLIC_SUPABASE_URL=your-project-url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
