import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add debugging for environment variables
console.log("Supabase initialization:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.substring(0, 10) + '...' || 'undefined'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Create the Supabase client with site URL configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Set the site URL to the current origin (works in both development and production)
    site: window.location.origin,
    // Set the redirect URL for email confirmations
    redirectTo: `${window.location.origin}/auth/callback`
  }
})

// Test the connection
supabase.auth.getSession().then(response => {
  console.log("Supabase connection test:", {
    success: !!response,
    hasSession: !!response.data?.session,
    error: response.error || 'none'
  });
}).catch(error => {
  console.error("Supabase connection test failed:", error);
});
