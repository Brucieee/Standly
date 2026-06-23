import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseInstance: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      get 'x-login-code'() {
        return localStorage.getItem('standly_login_code') || '';
      }
    } as any
  }
});

export const getSupabase = () => supabaseInstance;

export const initSupabaseWithCode = (code: string) => {
  localStorage.setItem('standly_login_code', code);
  if (supabaseInstance && (supabaseInstance as any).rest) {
    (supabaseInstance as any).rest.headers['x-login-code'] = code;
  }
};

export const supabase = supabaseInstance;