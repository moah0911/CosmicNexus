import { useState } from 'react'
import { motion } from 'framer-motion'

const ConnectionCard = ({ connection, sourceNode, targetNode, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  if (!sourceNode || !targetNode) {
    return null
  }

  // Get category color for styling
  const getCategoryColor = (category) => {
    switch (category) {
      case 'art': return 'rose'
      case 'science': return 'blue'
      case 'history': return 'amber'
      case 'music': return 'purple'
      case 'literature': return 'emerald'
      case 'philosophy': return 'indigo'
      case 'technology': return 'cyan'
      case 'hobby': return 'pink'
      default: return 'gray'
    }
  }

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'art': return 'palette'
      case 'science': return 'atom'
      case 'history': return 'hourglass-split'
      case 'music': return 'music-note-beamed'
      case 'literature': return 'book'
      case 'philosophy': return 'lightbulb'
      case 'technology': return 'cpu'
      case 'hobby': return 'controller'
      default: return 'tag'
    }
  }

  // Get icon for relationship type
  const getRelationshipIcon = (relationshipType) => {
    switch (relationshipType) {
      case 'influences': return 'arrow-right'
      case 'inspires': return 'lightbulb'
      case 'contrasts': return 'shuffle'
      case 'builds_on': return 'layers'
      case 'complements': return 'puzzle'
      default: return 'link'
    }
  }

  // Format relationship type for display
  const formatRelationshipType = (relationshipType) => {
    if (!relationshipType) return 'related'
    return relationshipType.replace(/_/g, ' ')
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, scale: 0.9 }
  }

  return (
    <motion.div 
      className="connection-card bg-black/40 border border-purple-800/30 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
      style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.05)' }}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-black/60 border border-purple-700/30 flex items-center justify-center text-purple-400">
              <i className={`bi bi-${getCategoryIcon(sourceNode.category)}`}></i>
            </div>
            <span className="ml-2 text-purple-300 font-medium">{sourceNode.title}</span>
          </div>
          
          <div className="flex items-center justify-center px-3 py-1 rounded-full bg-black/60 shadow-sm border border-purple-700/30">
            <i className={`bi bi-${getRelationshipIcon(connection.relationship_type || 'related')} text-purple-400 mr-1`}></i>
            <span className="text-xs text-purple-300 capitalize">{formatRelationshipType(connection.relationship_type || 'related')}</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-black/60 border border-purple-700/30 flex items-center justify-center text-purple-400">
              <i className={`bi bi-${getCategoryIcon(targetNode.category)}`}></i>
            </div>
            <span className="ml-2 text-purple-300 font-medium">{targetNode.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onDelete && (
            <button
              onClick={() => onDelete(connection)}
              className="text-red-400 hover:text-red-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm border border-red-700/30 transition-all duration-200 hover:scale-110"
              title="Delete connection"
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-purple-400 hover:text-purple-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm border border-purple-700/30 transition-all duration-200 hover:scale-110"
          >
            <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
        <p className="text-purple-200 mb-4">
          {connection.description}
        </p>

        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-black/60 p-3 rounded-md shadow-sm border border-purple-700/30">
              <h4 className="font-medium text-sm mb-1 flex items-center text-purple-300">
                <i className={`bi bi-${getCategoryIcon(sourceNode.category)} mr-1 text-purple-400`}></i>
                {sourceNode.title}
              </h4>
              <p className="text-xs text-purple-400">{sourceNode.description}</p>
            </div>
            <div className="bg-black/60 p-3 rounded-md shadow-sm border border-purple-700/30">
              <h4 className="font-medium text-sm mb-1 flex items-center text-purple-300">
                <i className={`bi bi-${getCategoryIcon(targetNode.category)} mr-1 text-purple-400`}></i>
                {targetNode.title}
              </h4>
              <p className="text-xs text-purple-400">{targetNode.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-purple-800/30">
        <div className="flex items-center space-x-1">
          <i className="bi bi-calendar-event text-purple-400 text-sm"></i>
          <span className="text-xs text-purple-400">
            {new Date(connection.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-xs text-purple-400 mr-2">Connection Strength:</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`bi bi-star-fill text-xs ${i < connection.strength ? 'text-amber-400' : 'text-purple-700'}`}
              ></i>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ConnectionCard