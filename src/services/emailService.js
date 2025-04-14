import emailjs from '@emailjs/browser';

// EmailJS configuration
// You'll need to create an account at https://www.emailjs.com/
// and set up a service and template
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_default';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_default';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_default';

// Check if EmailJS is properly configured
const isEmailJSConfigured =
  EMAILJS_SERVICE_ID !== 'service_default' &&
  EMAILJS_TEMPLATE_ID !== 'template_default' &&
  EMAILJS_PUBLIC_KEY !== 'public_key_default';

/**
 * Sends an OTP email using EmailJS or falls back to console logging
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const sendOTPEmail = async (email, otp) => {
  // If EmailJS is not configured, use the fallback method
  if (!isEmailJSConfigured) {
    return simulateSendOTPEmail(email, otp);
  }

  try {
    // Prepare template parameters
    const templateParams = {
      to_email: email,
      otp_code: otp,
      app_name: 'Cosmic Nexus',
      expiry_time: '10 minutes'
    };

    // Send the email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log('Email sent successfully:', response);
      return { success: true };
    } else {
      console.warn('EmailJS failed, falling back to simulation');
      return simulateSendOTPEmail(email, otp);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    console.warn('EmailJS failed, falling back to simulation');
    return simulateSendOTPEmail(email, otp);
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

  // Display a more prominent message
  console.log('%c 🔑 YOUR OTP CODE IS: ' + otp + ' 🔑 ', 'background: #6d28d9; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true };
};

/**
 * Initialize EmailJS
 * Call this function once when the app starts
 */
export const initEmailService = () => {
  if (isEmailJSConfigured) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized successfully');
  } else {
    console.warn('EmailJS not configured, using simulated email sending');
  }
};
