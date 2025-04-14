import { supabase } from '../lib/supabase';

/**
 * Sends an OTP email to the user
 * @param {string} email - User's email
 * @param {string} otp - OTP code to send
 * @returns {Promise<{success: boolean, error: Error}>} - Result of the operation
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    // In a real application, you would use a proper email service like SendGrid, Mailgun, etc.
    // For this example, we'll use Supabase's built-in email service with a custom template
    
    // Call a Supabase Edge Function to send the email
    // Note: You would need to create this function in your Supabase project
    const { error } = await supabase.functions.invoke('send-otp-email', {
      body: { email, otp }
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
};

/**
 * For development/demo purposes only
 * This simulates sending an OTP email by displaying it in the console
 * @param {string} email - User's email
 * @param {string} otp - OTP code to send
 * @returns {Promise<{success: boolean}>} - Always returns success
 */
export const simulateSendOTPEmail = async (email, otp) => {
  console.log(`
  ===============================================
  SIMULATED EMAIL TO: ${email}
  ===============================================
  Subject: Your Cosmic Nexus Verification Code
  
  Hello,
  
  Thank you for registering with Cosmic Nexus!
  
  Your verification code is: ${otp}
  
  This code will expire in 10 minutes.
  
  If you didn't request this code, please ignore this email.
  
  Best regards,
  The Cosmic Nexus Team
  ===============================================
  `);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true };
};
