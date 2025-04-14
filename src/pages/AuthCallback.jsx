import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

/**
 * This component handles authentication callbacks from Supabase
 * It's used for email confirmation and password reset
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL hash parameters
        const hashParams = window.location.hash.substring(1);
        const params = new URLSearchParams(hashParams);
        
        // Check if we have the necessary tokens
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          // Show success message based on the type
          if (type === 'signup') {
            toast.success('Email confirmed successfully! You can now log in.');
            navigate('/login');
          } else if (type === 'recovery') {
            toast.success('Password reset successful! You can now log in with your new password.');
            navigate('/login');
          } else {
            // Default to dashboard for other auth types
            navigate('/dashboard');
          }
        } else {
          // No tokens found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  // Show a loading message while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Processing Authentication</h1>
        <p className="text-center text-gray-600 mb-4">Please wait while we verify your credentials...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
