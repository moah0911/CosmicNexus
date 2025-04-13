import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const InterestNode = ({ node, onEdit, onDelete, onSelect, isSelected, connectionCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const cardRef = useRef(null)
  
  // Generate a border color based on the node category
  const getBorderColor = () => {
    switch (node.category) {
      case 'art':
        return 'border-rose-500'
      case 'science':
        return 'border-blue-500'
      case 'history':
        return 'border-amber-500'
      case 'music':
        return 'border-purple-500'
      case 'literature':
        return 'border-emerald-500'
      case 'philosophy':
        return 'border-indigo-500'
      case 'technology':
        return 'border-cyan-500'
      case 'hobby':
        return 'border-pink-500'
      default:
        return 'border-gray-500'
    }
  }
  
  // Generate a background color based on the node category
  const getBackgroundGradient = () => {
    switch (node.category) {
      case 'art':
        return 'bg-gradient-to-br from-rose-50 to-rose-100'
      case 'science':
        return 'bg-gradient-to-br from-blue-50 to-blue-100'
      case 'history':
        return 'bg-gradient-to-br from-amber-50 to-amber-100'
      case 'music':
        return 'bg-gradient-to-br from-purple-50 to-purple-100'
      case 'literature':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100'
      case 'philosophy':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100'
      case 'technology':
        return 'bg-gradient-to-br from-cyan-50 to-cyan-100'
      case 'hobby':
        return 'bg-gradient-to-br from-pink-50 to-pink-100'
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100'
    }
  }
  
  // Get icon for category
  const getCategoryIcon = () => {
    switch (node.category) {
      case 'art':
        return 'bi-palette'
      case 'science':
        return 'bi-atom'
      case 'history':
        return 'bi-hourglass-split'
      case 'music':
        return 'bi-music-note-beamed'
      case 'literature':
        return 'bi-book'
      case 'philosophy':
        return 'bi-lightbulb'
      case 'technology':
        return 'bi-cpu'
      case 'hobby':
        return 'bi-controller'
      default:
        return 'bi-tag'
    }
  }
  
  // Get accent color for category
  const getAccentColor = () => {
    switch (node.category) {
      case 'art':
        return 'bg-rose-500'
      case 'science':
        return 'bg-blue-500'
      case 'history':
        return 'bg-amber-500'
      case 'music':
        return 'bg-purple-500'
      case 'literature':
        return 'bg-emerald-500'
      case 'philosophy':
        return 'bg-indigo-500'
      case 'technology':
        return 'bg-cyan-500'
      case 'hobby':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  // Get text color for category
  const getTextColor = () => {
    switch (node.category) {
      case 'art':
        return 'text-rose-600'
      case 'science':
        return 'text-blue-600'
      case 'history':
        return 'text-amber-600'
      case 'music':
        return 'text-purple-600'
      case 'literature':
        return 'text-emerald-600'
      case 'philosophy':
        return 'text-indigo-600'
      case 'technology':
        return 'text-cyan-600'
      case 'hobby':
        return 'text-pink-600'
      default:
        return 'text-gray-600'
    }
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }
  
  // Use the connection count from props
  const getConnectionCount = () => {
    // Return the actual connection count without adding 1
    return connectionCount;
  }
  
  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    hover: { 
      y: -12,
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { 
        duration: 0.15
      }
    }
  }
  
  // Glow effect variants
  const glowVariants = {
    initial: { 
      opacity: 0,
      scale: 0.85
    },
    hover: { 
      opacity: [0.15, 0.25, 0.15], 
      scale: 1.05,
      transition: { 
        opacity: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        },
        scale: {
          duration: 0.3
        }
      }
    }
  }
  
  const buttonVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: isHovered ? 1 : 0,
      scale: isHovered ? 1 : 0.8,
      transition: { duration: 0.2 }
    }
  }
  
  // Generate a pattern for the card background
  const getPatternStyle = () => {
    const baseColor = getNodeColor()
    return {
      backgroundImage: `
        radial-gradient(${baseColor}10 1px, transparent 1px),
        radial-gradient(${baseColor}10 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px'
    }
  }
  
  // Get node color in hex
  const getNodeColor = () => {
    switch (node.category) {
      case 'art': return '#f43f5e' // rose-500
      case 'science': return '#3b82f6' // blue-500
      case 'history': return '#f59e0b' // amber-500
      case 'music': return '#a855f7' // purple-500
      case 'literature': return '#10b981' // emerald-500
      case 'philosophy': return '#6366f1' // indigo-500
      case 'technology': return '#06b6d4' // cyan-500
      case 'hobby': return '#ec4899' // pink-500
      default: return '#6b7280' // gray-500
    }
  }
  
  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(node.id)}
      className={`node-card relative overflow-hidden ${getBorderColor()} ${getBackgroundGradient()} 
        ${isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'shadow-md'} 
        resonance-node transition-all duration-300 backdrop-blur-sm`}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={getPatternStyle()}
      ></div>
      
      {/* Glowing effect for selected nodes */}
      {isSelected && (
        <motion.div 
          className="absolute inset-0 opacity-20 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle at center, ${getNodeColor()} 0%, transparent 70%)`
          }}
        />
      )}
      
      {/* Category accent bar */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${getAccentColor()}`}></div>
      
      {/* Content with left padding for accent bar */}
      <div className="pl-3 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-lg font-bold text-neutral-900 line-clamp-1 ${isHovered ? getTextColor() : ''}`}>
            {node.title}
          </h3>
          
          <div className={`flex space-x-1 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onEdit(node)
              }}
              className="text-neutral-500 hover:text-primary-600 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <i className="bi bi-pencil text-sm"></i>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node.id)
              }}
              className="text-neutral-500 hover:text-red-600 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <i className="bi bi-trash text-sm"></i>
            </button>
          </div>
        </div>
        
        <div className="mb-4 flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${getAccentColor()}`}>
            <i className={`bi ${getCategoryIcon()} text-white`}></i>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-700 capitalize block">
              {node.category}
            </span>
            <span className="text-xs text-neutral-500 block">
              {formatDate(node.created_at)}
            </span>
          </div>
          
          {/* Connection indicator */}
          <div className="ml-auto flex items-center">
            <span className="text-xs text-neutral-500 mr-1">
              <i className="bi bi-diagram-3 mr-1"></i>
              {getConnectionCount()}
            </span>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-70 backdrop-blur-sm p-3 rounded-md mb-3 relative overflow-hidden">
          <p className={`text-neutral-700 text-sm ${showFullDescription ? '' : 'line-clamp-3'}`}>
            {node.description}
          </p>
          
          {node.description.length > 150 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullDescription(!showFullDescription);
              }}
              className={`text-xs ${getTextColor()} font-medium mt-1 flex items-center`}
            >
              {showFullDescription ? (
                <>Show less <i className="bi bi-chevron-up ml-1"></i></>
              ) : (
                <>Show more <i className="bi bi-chevron-down ml-1"></i></>
              )}
            </button>
          )}
        </div>
        
        {node.notes && (
          <div className="bg-white bg-opacity-40 p-3 rounded-md text-xs text-neutral-600 relative">
            <div className="flex items-center mb-1">
              <i className={`bi bi-journal-text mr-1.5 ${getTextColor()}`}></i>
              <span className="font-medium">Personal Notes</span>
            </div>
            <p className="line-clamp-2 italic">{node.notes}</p>
          </div>
        )}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 z-20">
          <div className="w-0 h-0 border-t-[30px] border-r-[30px] border-t-primary-500 border-r-transparent"></div>
          <div className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center">
            <i className="bi bi-check-lg text-white text-sm"></i>
          </div>
        </div>
      )}
      
      {/* Bottom decorative bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
    </motion.div>
  )
}

export default InterestNode
