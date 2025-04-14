import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const Footer = () => {
  const location = useLocation()
  const [footerHeight, setFooterHeight] = useState('auto')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Adjust footer based on screen size
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // Adjust footer height based on screen size
      if (window.innerWidth < 640) { // mobile
        setFooterHeight('auto')
      } else {
        setFooterHeight('auto')
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial call

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Determine if we should use a compact footer on certain pages
  const isCompactPage = ['/map', '/insights'].some(path => location.pathname.includes(path))

  return (
    <footer
      className={`bg-black border-t border-purple-900/30 text-white relative transition-all duration-300 ${isCompactPage ? 'py-3' : 'py-4 md:py-6'}`}
      style={{ height: footerHeight, zIndex: 40 }}
    >
      {/* Sparkle effects */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '30%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '50%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className={`flex ${isCompactPage ? 'flex-row justify-between items-center' : 'flex-col md:flex-row justify-center md:justify-between items-center'} space-y-4 md:space-y-0`}>
          {/* Only show the email link on non-compact pages or on larger screens */}
          {(!isCompactPage || windowWidth >= 768) && (
            <a
              href="mailto:stormshots0911@gmail.com"
              className="text-purple-300 hover:text-purple-100 transition-all duration-300 transform hover:scale-105 flex items-center bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
            >
              <i className="bi bi-envelope-fill mr-2"></i>
              <span>Talk to Creator</span>
            </a>
          )}

          <div className={`text-gray-400 text-xs md:text-sm ${isCompactPage ? '' : 'mt-4 md:mt-0'}`}>
            © 2025 moah0911 under MIT license
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
