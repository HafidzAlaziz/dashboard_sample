import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
        if (!supabaseUrl) console.warn('Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is missing!');
        if (!supabaseAnonKey) console.warn('Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is missing!');
        console.warn('Real-time features will not work until .env.local is correctly configured.');
    }
}

// Hanya buat client jika URL valid untuk mencegah crash
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any;
