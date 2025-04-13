import { Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import MouseTrail from './MouseTrail'
import PageTransition from './PageTransition'
import AnimatedBackground from './AnimatedBackground'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'

const Layout = () => {
  const { user } = useAuth()
  const location = useLocation()
  
  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      {/* Fixed background to prevent white flashes */}
      <div className="fixed inset-0 bg-black -z-10"></div>
      
      {/* Cosmic background with stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70%', left: '15%', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '1.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ top: '80%', left: '75%', animationDelay: '0.3s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-purple-300 animate-pulse" style={{ top: '25%', left: '30%', animationDelay: '0.9s', boxShadow: '0 0 8px 2px rgba(216, 180, 254, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-indigo-300 animate-pulse" style={{ top: '55%', left: '85%', animationDelay: '1.7s', boxShadow: '0 0 8px 2px rgba(165, 180, 252, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-blue-300 animate-pulse" style={{ top: '85%', left: '40%', animationDelay: '1.1s', boxShadow: '0 0 8px 2px rgba(147, 197, 253, 0.8)' }}></div>
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/10 to-black/30 z-0 pointer-events-none"></div>
      
      <MouseTrail />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
