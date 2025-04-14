import { useState } from 'react'

const ConnectionCard = ({ connection, sourceNode, targetNode }) => {
  const [expanded, setExpanded] = useState(false)

  if (!sourceNode || !targetNode) {
    return null
  }

  // This function is no longer used with the new dark theme design
  // Keeping it commented for reference in case we need to revert
  /*
  const getGradientColors = () => {
    const sourceColor = getCategoryColor(sourceNode.category)
    const targetColor = getCategoryColor(targetNode.category)
    return `from-${sourceColor}-100 via-white to-${targetColor}-100`
  }
  */

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
      case 'art': return 'bi-palette'
      case 'science': return 'bi-atom'
      case 'history': return 'bi-hourglass-split'
      case 'music': return 'bi-music-note-beamed'
      case 'literature': return 'bi-book'
      case 'philosophy': return 'bi-lightbulb'
      case 'technology': return 'bi-cpu'
      case 'hobby': return 'bi-controller'
      default: return 'bi-tag'
    }
  }

  // Get icon for relationship type
  const getRelationshipIcon = (relationshipType) => {
    switch (relationshipType) {
      case 'influences': return 'bi-arrow-right'
      case 'inspires': return 'bi-lightbulb'
      case 'contrasts': return 'bi-shuffle'
      case 'builds_on': return 'bi-layers'
      case 'complements': return 'bi-puzzle'
      default: return 'bi-link'
    }
  }

  // Format relationship type for display
  const formatRelationshipType = (relationshipType) => {
    if (!relationshipType) return 'related'
    return relationshipType.replace('_', ' ')
  }

  return (
    <div className="connection-card bg-black/40 border border-purple-800/30 hover:shadow-lg transition-all duration-300"
      style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.05)' }}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(sourceNode.category)}-900/40 text-${getCategoryColor(sourceNode.category)}-400 border border-${getCategoryColor(sourceNode.category)}-700/30`}>
            <i className={`bi ${getCategoryIcon(sourceNode.category)}`}></i>
          </div>
          <h3 className="font-medium text-purple-300">{sourceNode.title}</h3>
          <div className="flex items-center justify-center px-3 py-1 rounded-full bg-black/60 shadow-sm border border-purple-700/30">
            <i className={`bi ${getRelationshipIcon(connection.relationship_type)} text-purple-400 mr-1`}></i>
            <span className="text-xs text-purple-300 capitalize">{formatRelationshipType(connection.relationship_type)}</span>
          </div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(targetNode.category)}-900/40 text-${getCategoryColor(targetNode.category)}-400 border border-${getCategoryColor(targetNode.category)}-700/30`}>
            <i className={`bi ${getCategoryIcon(targetNode.category)}`}></i>
          </div>
          <h3 className="font-medium text-purple-300">{targetNode.title}</h3>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-purple-400 hover:text-purple-300 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-purple-700/30"
        >
          <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
        <p className="text-purple-200 mb-4">
          {connection.description}
        </p>

        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-black/60 p-3 rounded-md shadow-sm border border-purple-700/30">
              <h4 className="font-medium text-sm mb-1 flex items-center text-purple-300">
                <i className={`bi ${getCategoryIcon(sourceNode.category)} mr-1 text-${getCategoryColor(sourceNode.category)}-400`}></i>
                {sourceNode.title}
              </h4>
              <p className="text-xs text-purple-400">{sourceNode.description}</p>
            </div>
            <div className="bg-black/60 p-3 rounded-md shadow-sm border border-purple-700/30">
              <h4 className="font-medium text-sm mb-1 flex items-center text-purple-300">
                <i className={`bi ${getCategoryIcon(targetNode.category)} mr-1 text-${getCategoryColor(targetNode.category)}-400`}></i>
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
    </div>
  )
}

export default ConnectionCard
