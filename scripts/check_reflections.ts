import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkReflectionsTable() {
    console.log('Checking if reflections table exists...');

    // Try to select from the table. If it doesn't exist, this will error.
    const { data, error } = await supabase.from('reflections').select('count', { count: 'exact', head: true });

    if (error) {
        console.log('❌ Error accessing reflections table:', error.message);
        if (error.code === '42P01') { // undefined_table
            console.log('Reason: The table "reflections" does not exist.');
        }
    } else {
        console.log('✅ Reflections table exists!');
    }
}

checkReflectionsTable();
