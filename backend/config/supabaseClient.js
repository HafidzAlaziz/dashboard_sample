
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Try standard names first, then frontend-style names (common when copying from Next.js)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Loading Supabase Config...');
console.log('URL available:', !!supabaseUrl);
console.log('Key available:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Supabase credentials missing in .env file!");
    console.error("   Please ensure you have SUPABASE_URL and SUPABASE_ANON_KEY defined.");
    console.error("   (Or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)");
    throw new Error("Supabase URL and Key are required.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
