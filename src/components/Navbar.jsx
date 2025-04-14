import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-purple-400 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-purple-500 after:to-indigo-500'
      : 'text-purple-200 hover:text-purple-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-gradient-to-r after:from-purple-500 after:to-indigo-500 after:transition-all after:duration-300'
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-sm border-b border-purple-900/50' : 'bg-black/60 border-b border-purple-900/30'}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-auto py-3 md:py-4 lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
              <i className="bi bi-stars text-xl relative z-10"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                }}>
              </div>
            </div>
            <div className="group">
              <span className="font-serif text-xl font-bold text-purple-200 group-hover:text-purple-400 transition-colors duration-300">Cosmic</span>
              <span className="font-serif text-xl font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">Nexus</span>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-indigo-500 mt-0.5 transition-all duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActive('/')} transition-colors duration-200`}>Home</Link>

            {user ? (
              <>
                <Link to="/dashboard" className={`${isActive('/dashboard')} transition-colors duration-200`}>Dashboard</Link>
                <Link to="/map" className={`${isActive('/map')} transition-colors duration-200 relative group`}>
                  <span>Cosmic Explorer</span>
                </Link>
                <Link to="/insights-landing" className={`${isActive('/insights-landing')} transition-colors duration-200`}>Cosmic Insights</Link>
                <Link to="/connections" className={`${isActive('/connections')} transition-colors duration-200`}>Connections</Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-purple-200 hover:text-purple-400">
                    <span>Account</span>
                    <i className="bi bi-chevron-down text-sm"></i>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-purple-900/50 backdrop-blur-sm"
                    style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-900/30">Profile</Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-purple-200 hover:bg-purple-900/30"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-full border border-purple-700 text-purple-300 hover:text-white relative overflow-hidden group transition-all duration-300 hover:border-purple-500"
                  style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)' }}>
                  <span className="relative z-10 transition-colors duration-300">Log In</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-80"></span>
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white relative overflow-hidden group transition-all duration-300 hover:from-purple-600 hover:to-indigo-600"
                  style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}>
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute inset-0 bg-white transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-300 opacity-0 group-hover:opacity-10"></span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-purple-300 hover:text-purple-400 focus:outline-none relative"
            >
              <i className={`bi ${isMenuOpen ? 'bi-x' : 'bi-list'} text-2xl`}></i>
              <div className="absolute inset-0 bg-purple-800/20 rounded-full scale-0 animate-ping-slow"></div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-900/30 bg-black/90 backdrop-blur-md transition-all duration-300 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-3 px-2">
              <Link
                to="/"
                className={`${isActive('/')} px-2 py-1 rounded-md`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`${isActive('/dashboard')} px-2 py-1 rounded-md`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/map"
                    className={`${isActive('/map')} px-2 py-1 rounded-md flex items-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Cosmic Explorer</span>
                  </Link>
                  <Link
                    to="/insights-landing"
                    className={`${isActive('/insights-landing')} px-2 py-1 rounded-md flex items-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Cosmic Insights</span>
                  </Link>
                  <Link
                    to="/connections"
                    className={`${isActive('/connections')} px-2 py-1 rounded-md`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connections
                  </Link>
                  <Link
                    to="/profile"
                    className={`${isActive('/profile')} px-2 py-1 rounded-md`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-neutral-600 hover:text-primary-600 px-2 py-1 rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full border border-purple-700 text-purple-300 hover:text-white relative overflow-hidden group transition-all duration-300 hover:border-purple-500 text-center"
                    style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 transition-colors duration-300">Log In</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-80"></span>
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white relative overflow-hidden group transition-all duration-300 hover:from-purple-600 hover:to-indigo-600 text-center"
                    style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10">Sign Up</span>
                    <span className="absolute inset-0 bg-white transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-300 opacity-0 group-hover:opacity-10"></span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
