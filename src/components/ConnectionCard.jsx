import { useState } from 'react'

const ConnectionCard = ({ connection, sourceNode, targetNode }) => {
  const [expanded, setExpanded] = useState(false)
  
  if (!sourceNode || !targetNode) {
    return null
  }
  
  // Generate gradient colors based on node categories
  const getGradientColors = () => {
    const sourceColor = getCategoryColor(sourceNode.category)
    const targetColor = getCategoryColor(targetNode.category)
    return `from-${sourceColor}-100 via-white to-${targetColor}-100`
  }
  
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
  
  return (
    <div className={`connection-card bg-gradient-to-r ${getGradientColors()} hover:shadow-lg transition-all duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(sourceNode.category)}-100 text-${getCategoryColor(sourceNode.category)}-600`}>
            <i className={`bi ${getCategoryIcon(sourceNode.category)}`}></i>
          </div>
          <h3 className="font-medium text-neutral-900">{sourceNode.title}</h3>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
            <i className="bi bi-arrow-right text-neutral-400"></i>
          </div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(targetNode.category)}-100 text-${getCategoryColor(targetNode.category)}-600`}>
            <i className={`bi ${getCategoryIcon(targetNode.category)}`}></i>
          </div>
          <h3 className="font-medium text-neutral-900">{targetNode.title}</h3>
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-500 hover:text-primary-600 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
        >
          <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
        <p className="text-neutral-700 mb-4">
          {connection.description}
        </p>
        
        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white bg-opacity-80 p-3 rounded-md shadow-sm">
              <h4 className="font-medium text-sm mb-1 flex items-center">
                <i className={`bi ${getCategoryIcon(sourceNode.category)} mr-1 text-${getCategoryColor(sourceNode.category)}-500`}></i>
                {sourceNode.title}
              </h4>
              <p className="text-xs text-neutral-600">{sourceNode.description}</p>
            </div>
            <div className="bg-white bg-opacity-80 p-3 rounded-md shadow-sm">
              <h4 className="font-medium text-sm mb-1 flex items-center">
                <i className={`bi ${getCategoryIcon(targetNode.category)} mr-1 text-${getCategoryColor(targetNode.category)}-500`}></i>
                {targetNode.title}
              </h4>
              <p className="text-xs text-neutral-600">{targetNode.description}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200 border-opacity-50">
        <div className="flex items-center space-x-1">
          <i className="bi bi-calendar-event text-neutral-500 text-sm"></i>
          <span className="text-xs text-neutral-500">
            {new Date(connection.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-neutral-500 mr-2">Connection Strength:</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i}
                className={`bi bi-star-fill text-xs ${i < connection.strength ? 'text-amber-400' : 'text-neutral-300'}`}
              ></i>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionCard
