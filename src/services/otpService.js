import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { sendOTPEmail } from './emailService';

// Flag to track if we're using localStorage fallback
let usingLocalStorageFallback = false;

// Always use localStorage for simplicity and to avoid database issues
usingLocalStorageFallback = true;
console.log('Using localStorage for OTP storage');

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
 * Stores OTP in localStorage with expiration time
 * @param {string} email - User's email
 * @param {string} otp - Generated OTP code
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const storeOTP = async (email, otp, expiryMinutes = 10) => {
  try {
    // Calculate expiry time
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);

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
};

/**
 * Verifies OTP against stored value in localStorage
 * @param {string} email - User's email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const verifyOTP = async (email, otp) => {
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
    console.error('Error verifying OTP:', error);
    return { success: false, error };
  }
};

/**
 * Removes stored OTP data from localStorage
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const clearOTP = async (email) => {
  try {
    localStorage.removeItem(`otp_${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error clearing OTP:', error);
    return { success: false, error };
  }
};

/**
 * Sends an OTP to the user's email and stores it in localStorage
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const sendOTP = async (email) => {
  try {
    // Implement simple rate limiting with localStorage
    const rateLimitKey = `otp_ratelimit_${email}`;
    const rateLimitData = localStorage.getItem(rateLimitKey);

    if (rateLimitData) {
      const { count, timestamp } = JSON.parse(rateLimitData);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      if (timestamp > oneDayAgo) {
        if (count >= 5) {
          throw new Error('Too many verification attempts. Please try again later.');
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

    // Generate a new OTP
    const otp = generateOTP(6);

    // Store the OTP in localStorage
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // 10 minutes expiry

    localStorage.setItem(`otp_${email}`, JSON.stringify({
      otp,
      expiry: expiryTime.getTime(),
      created: new Date().getTime()
    }));

    // Send the OTP via email (or console in development)
    const { success: emailSuccess, error: emailError } = await sendOTPEmail(email, otp);

    if (!emailSuccess) throw emailError;

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error };
  }
};
