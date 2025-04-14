import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

/**
 * Component that handles authentication redirects
 * This component will detect authentication tokens in the URL and handle them properly
 */
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have an access token in the URL (from email confirmation)
    const handleAuthRedirect = async () => {
      // Check if we're on localhost and have auth parameters in the URL
      if (window.location.hostname === 'localhost' && 
          (location.hash.includes('access_token=') || 
           location.hash.includes('refresh_token=') || 
           location.hash.includes('type=signup'))) {
        
        try {
          // Extract the hash without the # symbol
          const hashParams = location.hash.substring(1);
          
          // Parse the hash parameters
          const params = new URLSearchParams(hashParams);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          if (accessToken && refreshToken) {
            // We have tokens, let's set the session
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              throw error;
            }
            
            // Redirect based on the type
            if (type === 'signup') {
              toast.success('Email confirmed successfully! You can now log in.');
              navigate('/login');
            } else {
              navigate('/dashboard');
            }
          }
        } catch (error) {
          console.error('Error handling auth redirect:', error);
          toast.error('Failed to authenticate. Please try logging in manually.');
          navigate('/login');
        }
      }
    };

    handleAuthRedirect();
  }, [location, navigate]);

  // This component doesn't render anything
  return null;
};

export default AuthRedirectHandler;
