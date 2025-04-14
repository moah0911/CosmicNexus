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
      // Store the password for later use after verification
      sessionStorage.setItem('pendingPassword', password);
      
      // First, create the user with Supabase but don't auto-confirm
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Disable email confirmation redirect
          emailRedirectTo: null,
          // Don't auto-confirm the email
          data: {
            email_confirmed: false
          }
        }
      });

      if (error) throw error;
      
      // Generate and send OTP using our custom service
      const { success: otpSuccess, error: otpError } = await sendOTP(email);
      
      if (!otpSuccess) throw otpError || new Error('Failed to send verification code');
      
      // Store the email for the verification page
      sessionStorage.setItem('pendingVerification', email);
      
      toast.success('Verification code sent to your email');
      console.log('Check your email or browser console for the verification code');

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
      // Check if this user has verified with OTP in our system
      const hasVerifiedWithOTP = localStorage.getItem(`email_confirmed_${email}`) === 'true';
      
      // Try to sign in with password
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // If the error is about email not being confirmed
        if (error.message.includes('Email not confirmed')) {
          // Check if the user has verified with OTP in our system
          if (hasVerifiedWithOTP) {
            // The user has verified with OTP but Supabase still has them marked as unconfirmed
            // Send a new OTP for them to verify again
            const { success: otpSuccess } = await sendOTP(email);
            
            if (otpSuccess) {
              // Store credentials for the verification page
              sessionStorage.setItem('pendingVerification', email);
              sessionStorage.setItem('pendingPassword', password);
              
              toast.info('Please verify your email one more time');
              return { success: false, needsVerification: true, email };
            }
          } else {
            // User hasn't verified with OTP yet, send them an OTP
            const { success: otpSuccess } = await sendOTP(email);
            
            if (otpSuccess) {
              // Store credentials for the verification page
              sessionStorage.setItem('pendingVerification', email);
              sessionStorage.setItem('pendingPassword', password);
              
              toast.info('Please verify your email before logging in');
              return { success: false, needsVerification: true, email };
            }
          }
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

      if (!storedEmail) {
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
      
      // If OTP is valid and we have a stored password, try to sign in
      if (storedPassword) {
        // First sign out to clear any existing session
        await supabase.auth.signOut();
        
        // Try to sign in with password
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: storedPassword
        });

        if (signInError) {
          console.warn('Auto sign-in failed:', signInError);
          // If the error is about email not being confirmed, we'll handle it specially
          if (signInError.message.includes('Email not confirmed')) {
            // Store that this user has verified with OTP but Supabase still needs confirmation
            localStorage.setItem(`otp_verified_${email}`, 'true');
          } else {
            // For other errors, we'll just continue and let the user log in manually
            console.warn('Sign-in error:', signInError.message);
          }
        } else {
          // If sign-in succeeded, sign out so the user can sign in manually on the login page
          await supabase.auth.signOut();
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
    resetPassword,
    verifyOTP,
    resendOTP
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
