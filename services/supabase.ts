import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

let supabaseInstance: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabase = () => supabaseInstance;

export const initSupabaseWithCode = (code: string) => {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-login-code': code
      }
    }
  });
};

// Export a proxy to always use the current instance
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    return (supabaseInstance as any)[prop];
  }
});