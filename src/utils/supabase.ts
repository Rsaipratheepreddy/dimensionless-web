import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtsmdeyxvsgxazgqbikm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c21kZXl4dnNneGF6Z3FiaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzU2MzQsImV4cCI6MjA4MTQ1MTYzNH0.Q-fUIsu7x9KSVCMxuqk39fw10Qc_rNpPp315GvMTgxw';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
