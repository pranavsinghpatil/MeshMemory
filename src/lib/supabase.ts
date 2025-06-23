import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  console.log('Session:', session);
  
  if (event === 'SIGNED_IN') {
    // Save the session to local storage
    localStorage.setItem('supabase.auth.token', session?.access_token || '');
    // Also set the token in the API client
    if (session?.access_token) {
      localStorage.setItem('meshmemory-token', session.access_token);
    }
  } else if (event === 'SIGNED_OUT') {
    // Clear local storage on sign out
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('meshmemory-token');
    localStorage.removeItem('meshmemory-user');
  }
});

export default supabase;
