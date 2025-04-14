import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-black border-t border-purple-900/30 text-white py-6 relative">
      {/* Sparkle effects */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '30%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '50%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col justify-center items-center space-y-4">
          <a
            href="mailto:stormshots0911@gmail.com"
            className="text-purple-300 hover:text-purple-100 transition-all duration-300 transform hover:scale-105 flex items-center bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-3 rounded-full"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
          >
            <i className="bi bi-envelope-fill mr-2"></i>
            <span>Talk to Creator</span>
          </a>
          
          <div className="text-gray-400 text-sm mt-4">
            © 2025 moah0911 under MIT license
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
