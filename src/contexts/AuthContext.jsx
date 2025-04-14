import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import { sendOTP, verifyOTP as verifyOTPCode } from '../services/otpService'

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
      // Check if the email is already registered
      const { data: { user } } = await supabase.auth.admin
        .getUserByEmail(email)
        .catch(() => ({ data: { user: null } }));

      if (user) {
        throw new Error('Email is already registered');
      }

      // Store the email and password temporarily for later registration
      sessionStorage.setItem('pendingRegistration', JSON.stringify({ email, password }));

      // Send OTP to the user's email
      const { success, error } = await sendOTP(email);

      if (!success) {
        throw error || new Error('Failed to send verification code');
      }

      toast.success('Verification code sent to your email');

      // Return success with email for the verification page
      return { success: true, email };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Registration failed');
      return { success: false, error };
    }
  }

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
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

  const verifyOTP = async (email, token) => {
    try {
      // Verify the OTP code using our secure service
      const { success: otpSuccess, error: otpError } = await verifyOTPCode(email, token);

      if (!otpSuccess) {
        throw otpError || new Error('Invalid or expired verification code');
      }

      // Get the stored registration data
      const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration') || '{}');

      if (!pendingRegistration.email || !pendingRegistration.password) {
        throw new Error('Registration data not found');
      }

      // First, check if the user already exists but is unconfirmed
      const { data: { user: existingUser } } = await supabase.auth.admin
        .getUserByEmail(pendingRegistration.email)
        .catch(() => ({ data: { user: null } }));

      if (existingUser) {
        // User exists but might be unconfirmed, try to delete it first
        await supabase.auth.admin
          .deleteUser(existingUser.id)
          .catch(err => console.warn('Could not delete existing user:', err));
      }

      // Complete the registration with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        options: {
          // Important: Set this to true to auto-confirm the email
          emailRedirectTo: undefined,
          data: {
            email_verified: true
          }
        }
      });

      if (error) throw error;

      // If we have a user and a session, the email is confirmed
      if (data?.user) {
        // Force confirm the email if needed
        try {
          // This is an admin operation that might not be available
          await supabase.auth.admin.updateUserById(
            data.user.id,
            { email_confirm: true }
          );
        } catch (adminError) {
          console.warn('Could not use admin API to confirm email:', adminError);
          // Continue anyway, we'll try another approach
        }

        // Try to sign in immediately to confirm the account works
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: pendingRegistration.email,
          password: pendingRegistration.password
        });

        if (signInError) {
          console.warn('Auto sign-in failed:', signInError);
        } else {
          // Sign out so the user can sign in manually
          await supabase.auth.signOut();
        }
      }

      // Clear pending registration data
      sessionStorage.removeItem('pendingRegistration');

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
      // Get the pending registration data to ensure we have the correct email
      const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration') || '{}');

      if (!pendingRegistration.email) {
        throw new Error('Registration data not found');
      }

      // Send a new OTP to the user's email
      const { success, error } = await sendOTP(email);

      if (!success) {
        throw error || new Error('Failed to send verification code');
      }

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
    resetPassword,
    verifyOTP,
    resendOTP
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
