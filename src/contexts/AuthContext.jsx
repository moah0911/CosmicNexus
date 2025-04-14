import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-toastify'
import { generateOTP, storeOTP, verifyOTP as verifyOTPCode, clearOTP } from '../utils/otpUtils'
import { simulateSendOTPEmail } from '../utils/emailUtils'

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
      // Generate a 6-digit OTP code
      const otp = generateOTP(6);

      // Store the OTP with a 10-minute expiry
      storeOTP(email, otp, 10);

      // Send the OTP via email (simulated for now)
      await simulateSendOTPEmail(email, otp);

      // Store the email and password temporarily for later registration
      sessionStorage.setItem('pendingRegistration', JSON.stringify({ email, password }));

      // Log the OTP for testing purposes
      console.log('Generated OTP for testing:', otp);

      toast.success('Verification code sent to your email. Check the console for the code.');

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
      // Verify the OTP code
      const isValid = verifyOTPCode(email, token);

      if (!isValid) {
        throw new Error('Invalid or expired verification code');
      }

      // Get the stored registration data
      const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration') || '{}');

      if (!pendingRegistration.email || !pendingRegistration.password) {
        throw new Error('Registration data not found');
      }

      // Complete the registration with Supabase
      const { error } = await supabase.auth.signUp({
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        options: {
          // Skip email verification since we've already verified with OTP
          emailRedirectTo: undefined,
          data: {
            email_verified: true
          }
        }
      });

      if (error) throw error;

      // Clear the OTP and pending registration data
      clearOTP(email);
      sessionStorage.removeItem('pendingRegistration');

      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
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

      // Generate a new OTP code
      const otp = generateOTP(6);

      // Store the new OTP with a 10-minute expiry
      storeOTP(email, otp, 10);

      // Send the OTP via email (simulated for now)
      await simulateSendOTPEmail(email, otp);

      toast.success('Verification code resent to your email');
      return { success: true };
    } catch (error) {
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
