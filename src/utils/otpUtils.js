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
 */
export const storeOTP = (email, otp, expiryMinutes = 10) => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
  
  const otpData = {
    otp,
    expiry: expiryTime.getTime(),
  };
  
  // Store OTP data in localStorage
  localStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
};

/**
 * Verifies OTP against stored value
 * @param {string} email - User's email
 * @param {string} otp - OTP code to verify
 * @returns {boolean} - Whether OTP is valid
 */
export const verifyOTP = (email, otp) => {
  const storedData = localStorage.getItem(`otp_${email}`);
  
  if (!storedData) {
    return false;
  }
  
  const { otp: storedOTP, expiry } = JSON.parse(storedData);
  const now = new Date().getTime();
  
  // Check if OTP is expired
  if (now > expiry) {
    // Remove expired OTP
    localStorage.removeItem(`otp_${email}`);
    return false;
  }
  
  // Check if OTP matches
  return otp === storedOTP;
};

/**
 * Removes stored OTP data
 * @param {string} email - User's email
 */
export const clearOTP = (email) => {
  localStorage.removeItem(`otp_${email}`);
};
