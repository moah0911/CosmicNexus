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
 * Initialize EmailJS
 * Call this function once when the app starts
 */
export const initEmailService = () => {
  if (isEmailJSConfigured) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized successfully');
  } else {
    console.warn('EmailJS not configured, using Supabase for email sending');
  }
};

/**
 * Sends a contact email using EmailJS
 * @param {string} name - Sender's name
 * @param {string} email - Sender's email
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, error?: Error}>} - Result of the operation
 */
export const sendContactEmail = async (name, email, message) => {
  if (!isEmailJSConfigured) {
    console.warn('EmailJS not configured, contact form will not work');
    return { success: false, error: new Error('Email service not configured') };
  }

  try {
    // Prepare template parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message
    };

    // Send the email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log('Contact email sent successfully:', response);
      return { success: true };
    } else {
      throw new Error('Failed to send contact email');
    }
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error };
  }
};
