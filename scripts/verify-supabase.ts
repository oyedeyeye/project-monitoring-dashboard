import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase_url')) {
    console.error('❌ Error: Supabase environment variables are missing or use placeholder values.');
    console.error('Please update .env with your actual VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyConnection() {
    console.log('🔄 Attempting to connect to Supabase...');
    try {
        const { data, error, count } = await supabase
            .from('mdas')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Connection Failed:', error.message);
            process.exit(1);
        }

        console.log('✅ Connection Successful!');
        console.log(`📊 Found ${count ?? 'unknown'} MDAs in the database.`);

        // Check one more table to be sure permissions work
        const { error: projectError } = await supabase.from('projects').select('project_id').limit(1);
        if (projectError) {
            console.warn('⚠️  Warning: Connected to MDAs but failed to fetch Projects:', projectError.message);
        } else {
            console.log('✅ Specific table access verified (projects).');
        }

    } catch (err: any) {
        console.error('❌ Unexpected Error:', err.message);
        process.exit(1);
    }
}

verifyConnection();
