import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP, resendOTP } = useAuth()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  useEffect(() => {
    // Get email from location state
    console.log('VerifyOTP location state:', location.state);

    if (location.state?.email) {
      setEmail(location.state.email);
      console.log('Email set from location state:', location.state.email);
    } else {
      console.log('No email in location state, redirecting to register');
      // If no email in state, redirect to register
      navigate('/register');
    }
  }, [location, navigate])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!otp) {
      return setError('Please enter the verification code')
    }

    setLoading(true)
    setError('')

    try {
      // Use the verifyOTP function from AuthContext
      const { success, error } = await verifyOTP(email, otp)

      if (success) {
        navigate('/login')
      } else if (error) {
        throw error
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setLoading(true)
    setError('')

    try {
      // Use the resendOTP function from AuthContext
      const { success, error } = await resendOTP(email)

      if (success) {
        setCountdown(60) // Set 60 seconds cooldown
      } else if (error) {
        throw error
      }
    } catch (err) {
      console.error('Resend error:', err)
      setError(err.message || 'Failed to resend verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900 p-4">
      <motion.div
        className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="p-8">
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a verification code to <span className="font-medium text-purple-600">{email}</span>
            </p>
          </motion.div>

          {error && (
            <motion.div
              className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

          <motion.form onSubmit={handleVerify} variants={itemVariants}>
            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                ) : (
                  <i className="bi bi-check-circle mr-2"></i>
                )}
                {loading ? 'Verifying...' : 'Verify Email'}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div
            className="mt-6 text-center"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={loading || countdown > 0}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors text-sm"
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
            </button>
          </motion.div>

          <motion.div
            className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">About Cosmic Nexus</h3>
            <p className="text-sm text-indigo-700">
              Cosmic Nexus is a sophisticated visual tool to map your interests and discover connections between them.
              Our platform helps you visualize your knowledge, find unexpected connections, and expand your understanding
              through interactive graph visualizations.
            </p>
          </motion.div>

          {/* Instructions for finding the OTP */}
          <motion.div
            className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm"
            variants={itemVariants}
          >
            <p className="font-medium">Need help finding your verification code?</p>
            <p>For testing purposes, the verification code is displayed in your browser's console.</p>
            <p className="mt-2">Open your browser's developer tools (F12 or right-click → Inspect) and look for a message with your OTP code.</p>
            <p className="mt-2 text-xs">You'll see a message like: "🔑 YOUR OTP CODE IS: 123456 🔑"</p>
          </motion.div>


        </div>
      </motion.div>
    </div>
  )
}

export default VerifyOTP
