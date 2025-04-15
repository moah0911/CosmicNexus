import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

const PromptTemplate = ({ title, description, icon, onGenerate, isLoading }) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleGenerateClick = () => {
    if (onGenerate) {
      onGenerate()
    } else {
      toast.info('This template is not yet implemented')
    }
  }

  return (
    <motion.div
      className="bg-black/40 border border-purple-800/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
      style={{ 
        boxShadow: isHovered ? '0 0 25px rgba(147, 51, 234, 0.15)' : '0 0 15px rgba(147, 51, 234, 0.05)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 opacity-0 transition-opacity duration-300"
        style={{ opacity: isHovered ? 0.5 : 0 }}
      />

      <div className="flex items-start mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white mr-4 relative overflow-hidden"
          style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}>
          <i className={`bi ${icon || 'bi-stars'} text-2xl relative z-10`}></i>
          <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
            style={{
              animationDuration: '3s',
              boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
            }}>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-purple-200">{title}</h3>
          <p className="text-purple-300 mt-1">{description}</p>
        </div>
      </div>

      <button
        onClick={handleGenerateClick}
        disabled={isLoading}
        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.2)' }}
      >
        {isLoading ? (
          <>
            <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <i className="bi bi-magic mr-2"></i>
            <span>Generate with this Template</span>
          </>
        )}
      </button>
    </motion.div>
  )
}

export default PromptTemplate