import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const RegistrationSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100 text-green-600"
            >
              <i className="bi bi-envelope-check text-3xl"></i>
            </motion.div>
            
            <motion.h1
              className="text-3xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Check Your Email
            </motion.h1>
            
            <motion.p
              className="text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              We've sent a confirmation link to your email address. Please check your inbox and click the link to complete your registration.
            </motion.p>
            
            <motion.div
              className="bg-blue-50 p-4 rounded-lg mb-8 text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="font-medium text-blue-800 mb-2">Important Notes:</h3>
              <ul className="text-blue-700 text-sm space-y-2">
                <li className="flex items-start">
                  <i className="bi bi-info-circle mr-2 mt-0.5"></i>
                  <span>The confirmation email may take a few minutes to arrive.</span>
                </li>
                <li className="flex items-start">
                  <i className="bi bi-info-circle mr-2 mt-0.5"></i>
                  <span>If you don't see it, please check your spam or junk folder.</span>
                </li>
                <li className="flex items-start">
                  <i className="bi bi-info-circle mr-2 mt-0.5"></i>
                  <span>The link in the email will expire after 24 hours.</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                to="/login"
                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                Go to Login
              </Link>
              
              <p className="text-gray-500 text-sm">
                Didn't receive the email? Check your spam folder or{' '}
                <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                  try again
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RegistrationSuccess