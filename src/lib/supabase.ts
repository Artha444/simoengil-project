import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * To connect to your Supabase project, create a `.env.local` file in the root of your project
 * and add the following environment variables (replace with your actual Supabase credentials):
 * 
 * NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
 * 
 * In a multi-project setup, you can connect multiple Next.js applications (e.g. public storefronts,
 * admin portals, or mobile apps) to the same centralized Supabase backend by sharing these identical env keys.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key';

if (supabaseUrl === 'https://dummy-project-id.supabase.co') {
  console.warn(
    'Supabase environment variables are missing! Falling back to dummy credentials. ' +
    'Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
