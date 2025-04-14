import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'

const AuthContext = createContext()

// Define the hook as a named function declaration but don't export it directly
function useAuthHook() {
  return useContext(AuthContext)
}

// Export the hook as a const to maintain consistent exports for Fast Refresh
export const useAuth = useAuthHook;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password) => {
    try {
      // Create the user with Supabase and let it handle email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Get the current site URL (works in both development and production)
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      toast.success('Confirmation email sent. Please check your inbox.');
      console.log('Check your email for the confirmation link from Supabase');

      // Return success
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Registration failed');
      return { success: false, error };
    }
  }

  const signIn = async (email, password) => {
    try {
      // Try to sign in with password
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // If the error is about email not being confirmed
        if (error.message.includes('Email not confirmed')) {
          // Inform the user they need to confirm their email
          toast.info('Please check your email for a confirmation link');
          return { success: false, emailNotConfirmed: true, error };
        }
        
        throw error;
      }
      
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Login failed')
      return { success: false, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.info('You have been signed out')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Sign out failed')
      return { success: false, error }
    }
  }

  const resetPassword = async (email) => {
    try {
      // Get the current site URL (works in both development and production)
      const siteUrl = window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
      })
      if (error) throw error
      toast.success('Password reset email sent')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email')
      return { success: false, error }
    }
  }

  // Helper function to confirm a user's email in Supabase
  const confirmUserEmail = async (email) => {
    try {
      // This is a workaround since we don't have direct access to confirm the email in Supabase
      // We'll use the admin API or a server function in a real production app
      
      // For now, we'll mark the user as confirmed in our local storage
      localStorage.setItem(`email_confirmed_${email}`, 'true');
      
      return { success: true };
    } catch (error) {
      console.error('Error confirming email:', error);
      return { success: false, error };
    }
  };

  const verifyOTP = async (email, token) => {
    try {
      // Get the email and password from session storage
      const storedEmail = sessionStorage.getItem('pendingVerification');
      const storedPassword = sessionStorage.getItem('pendingPassword');

      if (!storedEmail || !storedPassword) {
        throw new Error('No pending verification found. Please try registering again.');
      }

      if (email !== storedEmail) {
        console.warn('Email mismatch:', email, storedEmail);
        // Use the stored email if there's a mismatch
        email = storedEmail;
      }

      // First verify the OTP using our local service
      const { success: otpVerified, error: otpError } = await verifyOTPCode(email, token);
      
      if (!otpVerified) {
        throw otpError || new Error('Invalid verification code');
      }
      
      // Mark the user's email as confirmed in our system
      await confirmUserEmail(email);
      
      // Now that OTP is verified, create the user in Supabase
      // We set emailConfirm: false to prevent Supabase from sending a confirmation email
      const { data, error } = await supabase.auth.signUp({
        email,
        password: storedPassword,
        options: {
          emailRedirectTo: null,
          data: {
            email_confirmed: true // Mark as confirmed in user metadata
          }
        }
      });
      
      if (error) {
        // If the user already exists, that's fine
        if (!error.message.includes('User already registered')) {
          throw error;
        }
      }
      
      // Clear pending verification data
      sessionStorage.removeItem('pendingVerification');
      sessionStorage.removeItem('pendingPassword');

      toast.success('Email verified successfully! You can now log in.');
      return { success: true };
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Invalid verification code');
      return { success: false, error };
    }
  }

  const resendOTP = async (email) => {
    try {
      // Get the email from session storage
      const storedEmail = sessionStorage.getItem('pendingVerification');

      if (!storedEmail) {
        throw new Error('No pending verification found. Please try registering again.');
      }

      if (email !== storedEmail) {
        console.warn('Email mismatch:', email, storedEmail);
        // Use the stored email if there's a mismatch
        email = storedEmail;
      }

      // Use our custom OTP service to generate and send a new OTP
      const { success: otpSuccess, error: otpError } = await sendOTP(email);
      
      if (!otpSuccess) throw otpError || new Error('Failed to send verification code');

      toast.success('Verification code resent to your email');
      return { success: true };
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Failed to resend verification code');
      return { success: false, error };
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
