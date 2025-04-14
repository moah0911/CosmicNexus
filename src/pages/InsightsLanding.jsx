import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const InsightsLanding = () => {
  const navigate = useNavigate()
  const [isHovering, setIsHovering] = useState(false)

  // Automatically redirect to generate insights page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/generate-insights')
    }, 500) // Short delay for smooth transition

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => {
          const size = Math.random() * 2 + 1
          const top = Math.random() * 100
          const left = Math.random() * 100
          const animationDuration = Math.random() * 3 + 2

          return (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${top}%`,
                left: `${left}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `twinkle ${animationDuration}s infinite ease-in-out`
              }}
            />
          )
        })}
      </div>

      <motion.div
        className="text-center p-8 rounded-2xl relative z-10 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)' }}>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isHovering ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <i className="bi bi-lightbulb text-4xl relative z-10"></i>
          </motion.div>
          <div className="absolute inset-0 bg-purple-400 opacity-0 animate-pulse"
            style={{
              animationDuration: '3s',
              boxShadow: 'inset 0 0 20px rgba(167, 139, 250, 0.5)'
            }}>
          </div>
        </div>

        <motion.h1
          className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Unlock Cosmic Insights
        </motion.h1>

        <motion.p
          className="text-purple-300 text-lg mb-10 max-w-xl mx-auto"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Generate AI-powered insights to explore new dimensions and undiscovered territories in your cosmic knowledge universe.
        </motion.p>

        <motion.div
          className="mt-4 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="w-8 h-8 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
        </motion.div>
      </motion.div>

      {/* Add CSS for twinkling animation */}
      <style jsx="true">{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

export default InsightsLanding
