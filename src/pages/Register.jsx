import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate password match
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    
    // Validate password strength
    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    
    setLoading(true)
    
    try {
      const { success, error } = await signUp(email, password)
      
      if (success) {
        navigate('/login')
      } else {
        setError(error.message || 'Failed to create account')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
        <p className="text-neutral-600">Start exploring the connections between your interests</p>
      </div>
      
      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>
          
          <div className="text-sm text-neutral-600">
            <p>By creating an account, you agree to our:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><Link to="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
            ) : (
              <i className="bi bi-person-plus mr-2"></i>
            )}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
