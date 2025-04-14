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
      // Sign up with OTP verification instead of email confirmation link
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable redirect URL
          data: {
            email: email
          }
        }
      })

      if (error) throw error

      // Return success with email for the verification page
      return { success: true, email }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      return { success: false, error }
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
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      })

      if (error) throw error

      toast.success('Email verified successfully!')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Invalid verification code')
      return { success: false, error }
    }
  }

  const resendOTP = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) throw error

      toast.success('Verification code resent to your email')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification code')
      return { success: false, error }
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
