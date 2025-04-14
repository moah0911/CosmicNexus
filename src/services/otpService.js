import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { sendOTPEmail } from './emailService';

// Flag to track if we're using localStorage fallback
let usingLocalStorageFallback = false;

// Check if the OTP table exists
const checkOtpTableExists = async () => {
  try {
    const { error } = await supabase
      .from('otp_codes')
      .select('id')
      .limit(1);

    // If there's an error about the relation not existing, the table doesn't exist
    if (error && error.code === '42P01') {
      console.warn('OTP table does not exist, using localStorage fallback');
      usingLocalStorageFallback = true;
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error checking OTP table:', error);
    usingLocalStorageFallback = true;
    return false;
  }
};

// Initialize the check
checkOtpTableExists();

/**
 * Generates a random OTP code of specified length
 * @param {number} length - Length of the OTP code (default: 6)
 * @returns {string} - Generated OTP code
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
};

/**
 * Stores OTP in Supabase database with expiration time
 * Falls back to localStorage if the database table doesn't exist
 * @param {string} email - User's email
 * @param {string} otp - Generated OTP code
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const storeOTP = async (email, otp, expiryMinutes = 10) => {
  // Calculate expiry time
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);

  // If we're using localStorage fallback, store it there
  if (usingLocalStorageFallback) {
    try {
      // Store OTP data in localStorage
      localStorage.setItem(`otp_${email}`, JSON.stringify({
        otp,
        expiry: expiryTime.getTime(),
        created: new Date().getTime()
      }));

      return { success: true };
    } catch (error) {
      console.error('Error storing OTP in localStorage:', error);
      return { success: false, error };
    }
  }

  // Otherwise, use Supabase
  try {
    // First, delete any existing OTPs for this email
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email)
      .catch(err => console.warn('Could not delete existing OTPs:', err));

    // Insert new OTP
    const { error } = await supabase
      .from('otp_codes')
      .insert({
        id: uuidv4(),
        email,
        otp_code: otp,
        expires_at: expiryTime.toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      // If there's an error with the database, fall back to localStorage
      if (error.code === '42P01') { // relation does not exist
        usingLocalStorageFallback = true;
        return storeOTP(email, otp, expiryMinutes); // Recursive call will use localStorage
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error storing OTP in database:', error);

    // Fall back to localStorage if there's any database error
    try {
      usingLocalStorageFallback = true;
      localStorage.setItem(`otp_${email}`, JSON.stringify({
        otp,
        expiry: expiryTime.getTime(),
        created: new Date().getTime()
      }));

      return { success: true };
    } catch (lsError) {
      console.error('Error storing OTP in localStorage fallback:', lsError);
      return { success: false, error: lsError };
    }
  }
};

/**
 * Verifies OTP against stored value in Supabase or localStorage
 * @param {string} email - User's email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const verifyOTP = async (email, otp) => {
  // If we're using localStorage fallback, verify from there
  if (usingLocalStorageFallback) {
    try {
      const storedData = localStorage.getItem(`otp_${email}`);

      if (!storedData) {
        return { success: false, error: new Error('No verification code found') };
      }

      const { otp: storedOTP, expiry } = JSON.parse(storedData);
      const now = new Date().getTime();

      // Check if OTP is expired
      if (now > expiry) {
        // Remove expired OTP
        localStorage.removeItem(`otp_${email}`);
        return { success: false, error: new Error('Verification code has expired') };
      }

      // Check if OTP matches
      if (otp !== storedOTP) {
        return { success: false, error: new Error('Invalid verification code') };
      }

      // OTP is valid, delete it to prevent reuse
      localStorage.removeItem(`otp_${email}`);

      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP from localStorage:', error);
      return { success: false, error };
    }
  }

  // Otherwise, use Supabase
  try {
    // Get the OTP record
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .single();

    if (error) {
      // If there's an error with the database, fall back to localStorage
      if (error.code === '42P01') { // relation does not exist
        usingLocalStorageFallback = true;
        return verifyOTP(email, otp); // Recursive call will use localStorage
      }
      throw error;
    }

    if (!data) {
      return { success: false, error: new Error('Invalid verification code') };
    }

    // Check if OTP is expired
    const expiryTime = new Date(data.expires_at);
    const now = new Date();

    if (now > expiryTime) {
      // Delete expired OTP
      await clearOTP(email);
      return { success: false, error: new Error('Verification code has expired') };
    }

    // OTP is valid, delete it to prevent reuse
    await clearOTP(email);

    return { success: true };
  } catch (error) {
    console.error('Error verifying OTP from database:', error);

    // Try localStorage as a last resort
    try {
      usingLocalStorageFallback = true;
      return await verifyOTP(email, otp);
    } catch (lsError) {
      console.error('Error verifying OTP from localStorage fallback:', lsError);
      return { success: false, error: lsError };
    }
  }
};

/**
 * Removes stored OTP data from Supabase or localStorage
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const clearOTP = async (email) => {
  // If we're using localStorage fallback, clear from there
  if (usingLocalStorageFallback) {
    try {
      localStorage.removeItem(`otp_${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error clearing OTP from localStorage:', error);
      return { success: false, error };
    }
  }

  // Otherwise, use Supabase
  try {
    const { error } = await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email);

    if (error) {
      // If there's an error with the database, fall back to localStorage
      if (error.code === '42P01') { // relation does not exist
        usingLocalStorageFallback = true;
        return clearOTP(email); // Recursive call will use localStorage
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing OTP from database:', error);

    // Try to clear from localStorage as well just in case
    try {
      localStorage.removeItem(`otp_${email}`);
    } catch (lsError) {
      console.warn('Could not clear from localStorage:', lsError);
    }

    return { success: false, error };
  }
};

/**
 * Sends an OTP to the user's email and stores it in the database or localStorage
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const sendOTP = async (email) => {
  try {
    // Implement rate limiting even with localStorage
    let rateLimited = false;

    if (usingLocalStorageFallback) {
      // Check localStorage for rate limiting
      try {
        const rateLimitKey = `otp_ratelimit_${email}`;
        const rateLimitData = localStorage.getItem(rateLimitKey);

        if (rateLimitData) {
          const { count, timestamp } = JSON.parse(rateLimitData);
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

          if (timestamp > oneDayAgo) {
            if (count >= 5) {
              rateLimited = true;
            } else {
              // Update count
              localStorage.setItem(rateLimitKey, JSON.stringify({
                count: count + 1,
                timestamp: Date.now()
              }));
            }
          } else {
            // Reset if older than a day
            localStorage.setItem(rateLimitKey, JSON.stringify({
              count: 1,
              timestamp: Date.now()
            }));
          }
        } else {
          // First attempt
          localStorage.setItem(rateLimitKey, JSON.stringify({
            count: 1,
            timestamp: Date.now()
          }));
        }
      } catch (lsError) {
        console.warn('Error checking rate limit in localStorage:', lsError);
        // Continue anyway
      }
    } else {
      // Check database for rate limiting
      try {
        const { count, error: countError } = await supabase
          .from('otp_codes')
          .select('*', { count: 'exact' })
          .eq('email', email)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (countError) {
          if (countError.code === '42P01') { // relation does not exist
            usingLocalStorageFallback = true;
            return sendOTP(email); // Recursive call will use localStorage
          }
          throw countError;
        }

        // Rate limit: maximum 5 OTPs per email per day
        if (count >= 5) {
          rateLimited = true;
        }
      } catch (dbError) {
        console.warn('Error checking rate limit in database:', dbError);
        // Continue anyway, we'll check again when storing
      }
    }

    if (rateLimited) {
      throw new Error('Too many verification attempts. Please try again later.');
    }

    // Generate a new OTP
    const otp = generateOTP(6);

    // Store the OTP
    const { success: storeSuccess, error: storeError } = await storeOTP(email, otp);

    if (!storeSuccess) throw storeError;

    // Send the OTP via email
    const { success: emailSuccess, error: emailError } = await sendOTPEmail(email, otp);

    if (!emailSuccess) throw emailError;

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error };
  }
};
