import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testConnection() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('1. Testing Health Check...');
    try {
        const res = await fetch(`${supabaseUrl}/auth/v1/health`);
        console.log('Health Check Status:', res.status, res.statusText);
        if (res.status === 503) {
            console.error('CRITICAL: Supabase Auth service is returning 503 (Service Unavailable). This usually means the project is paused or has an issue.');
        }
    } catch (e) {
        console.error('Health Check Fetch Failed:', e);
    }

    console.log('\n2. Testing Database Query...');
    const start = Date.now();
    try {
        const { data, error } = await supabase.from('categories').select('count').limit(1);
        const duration = Date.now() - start;
        if (error) {
            console.error('Database Query Error:', error.message);
        } else {
            console.log(`Database Query Success! Took ${duration}ms`);
        }
    } catch (e) {
        console.error('Database Query Fatal Error:', e);
    }

    console.log('\n3. Testing Auth Service...');
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Auth Session Error:', error.message);
        } else {
            console.log('Auth Service responded correctly.');
        }
    } catch (e) {
        console.error('Auth Service Fatal Error:', e);
    }
}

testConnection();
