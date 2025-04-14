import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const { resetPassword } = useAuth()

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
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    try {
      const { success, error } = await resetPassword(email)

      if (success) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset email sent. Please check your inbox and follow the instructions to reset your password.' 
        })
        setEmail('') // Clear the email field after successful submission
      } else {
        setMessage({ 
          type: 'error', 
          text: error?.message || 'Failed to send reset email. Please try again.' 
        })
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again later.' 
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Clear message after 8 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg"
          >
            <i className="bi bi-key text-3xl"></i>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Reset Password
          </motion.h1>
          <motion.p
            className="text-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Enter your email to receive a password reset link
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {message.text && (
            <motion.div
              className={`mb-6 p-4 ${
                message.type === 'error' 
                  ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                  : 'bg-green-50 border-l-4 border-green-500 text-green-700'
              } rounded-lg flex items-start`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <i className={`bi ${
                message.type === 'error' 
                  ? 'bi-exclamation-circle' 
                  : 'bi-check-circle'
              } text-xl mr-3 mt-0.5`}></i>
              <div>
                <p className="font-medium">
                  {message.type === 'error' ? 'Error' : 'Success'}
                </p>
                <p className="text-sm">{message.text}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="bi bi-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </motion.div>

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
                  <i className="bi bi-envelope-paper mr-2"></i>
                )}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <motion.p
              className="text-neutral-600"
              variants={itemVariants}
            >
              Remember your password?{' '}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Sign In
                </Link>
              </motion.span>
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Need help?{' '}
          <Link to="/contact" className="text-purple-600 hover:text-purple-700">
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword