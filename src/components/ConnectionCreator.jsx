import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { generateConnections } from '../services/interestService'

const ConnectionCreator = ({ nodes, onConnectionCreated, onCancel }) => {
  const [sourceNode, setSourceNode] = useState(null)
  const [targetNode, setTargetNode] = useState(null)
  const [description, setDescription] = useState('')
  const [relationshipType, setRelationshipType] = useState('related')
  const [strength, setStrength] = useState(3)
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState(1) // 1: Select nodes, 2: Define relationship

  // Predefined relationship types
  const relationshipTypes = [
    { value: 'related', label: 'Related', icon: 'bi-link' },
    { value: 'influences', label: 'Influences', icon: 'bi-arrow-right' },
    { value: 'inspires', label: 'Inspires', icon: 'bi-lightbulb' },
    { value: 'contrasts', label: 'Contrasts', icon: 'bi-shuffle' },
    { value: 'builds_on', label: 'Builds On', icon: 'bi-layers' },
    { value: 'complements', label: 'Complements', icon: 'bi-puzzle' },
  ]

  // Generate a default description when nodes are selected
  useEffect(() => {
    if (sourceNode && targetNode) {
      const selectedRelationship = relationshipTypes.find(r => r.value === relationshipType)
      const relationshipLabel = selectedRelationship ? selectedRelationship.label.toLowerCase() : 'related to'
      
      setDescription(`${sourceNode.title} ${relationshipLabel} ${targetNode.title} in terms of conceptual frameworks, methodologies, and practical applications.`)
    } else {
      setDescription('')
    }
  }, [sourceNode, targetNode, relationshipType])

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

  const handleNodeSelect = (node) => {
    if (!sourceNode) {
      setSourceNode(node)
    } else if (!targetNode && node.id !== sourceNode.id) {
      setTargetNode(node)
      setStep(2) // Move to step 2 when both nodes are selected
    } else if (node.id === sourceNode.id) {
      setSourceNode(null)
    } else if (node.id === targetNode.id) {
      setTargetNode(null)
      setStep(1) // Go back to step 1 if target is deselected
    }
  }

  const handleCreateConnection = async () => {
    if (!sourceNode || !targetNode) {
      toast.warning('Please select both source and target nodes')
      return
    }

    if (!description.trim()) {
      toast.warning('Please provide a description for the connection')
      return
    }

    try {
      setIsCreating(true)

      // Prepare the connection data
      const connectionData = {
        manualDescription: description,
        strength: strength,
        relationshipType: relationshipType
      }

      // Call the API to create the connection
      const { success, connections, error } = await generateConnections(
        [sourceNode.id, targetNode.id], 
        connectionData
      )

      if (success) {
        toast.success('Connection created successfully!')
        onConnectionCreated(connections[0])
      } else {
        toast.error(error?.message || 'Failed to create connection')
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setSourceNode(null)
    setTargetNode(null)
    setDescription('')
    setRelationshipType('related')
    setStrength(3)
    setStep(1)
  }

  return (
    <div className="connection-creator">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 1 ? 'bg-purple-600 text-white' : 'bg-purple-900/50 text-purple-300'
          }`}>
            <span>1</span>
          </div>
          <div className={`h-1 w-12 ${step === 1 ? 'bg-purple-900/50' : 'bg-purple-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 2 ? 'bg-purple-600 text-white' : 'bg-purple-900/50 text-purple-300'
          }`}>
            <span>2</span>
          </div>
        </div>
      </div>

      {/* Step 1: Node Selection */}
      {step === 1 && (
        <div>
          <h3 className="text-xl font-medium text-purple-200 mb-4">Select Two Nodes to Connect</h3>
          
          <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/30 text-indigo-300 text-sm">
            <p className="flex items-center">
              <i className="bi bi-info-circle mr-2 text-indigo-400"></i>
              Click on two different nodes to create a connection between them.
            </p>
          </div>

          {/* Selected nodes preview */}
          {(sourceNode || targetNode) && (
            <div className="mb-6 p-4 bg-black/40 rounded-xl shadow-sm border border-purple-800/30">
              <h4 className="font-medium text-purple-200 mb-3">Selected Nodes</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1 p-3 rounded-lg bg-black/60 border border-purple-700/30 min-h-[60px] flex items-center">
                  {sourceNode ? (
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(sourceNode.category)}-900/40 text-${getCategoryColor(sourceNode.category)}-400 border border-${getCategoryColor(sourceNode.category)}-700/30`}>
                        <i className={`bi ${getCategoryIcon(sourceNode.category)}`}></i>
                      </div>
                      <span className="text-purple-300">{sourceNode.title}</span>
                      <button 
                        onClick={() => setSourceNode(null)}
                        className="text-purple-400 hover:text-purple-300 ml-2"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  ) : (
                    <span className="text-purple-500 italic">Select source node...</span>
                  )}
                </div>
                
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 border border-purple-700/30">
                  <i className="bi bi-arrow-right text-purple-400"></i>
                </div>
                
                <div className="flex-1 p-3 rounded-lg bg-black/60 border border-purple-700/30 min-h-[60px] flex items-center">
                  {targetNode ? (
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(targetNode.category)}-900/40 text-${getCategoryColor(targetNode.category)}-400 border border-${getCategoryColor(targetNode.category)}-700/30`}>
                        <i className={`bi ${getCategoryIcon(targetNode.category)}`}></i>
                      </div>
                      <span className="text-purple-300">{targetNode.title}</span>
                      <button 
                        onClick={() => setTargetNode(null)}
                        className="text-purple-400 hover:text-purple-300 ml-2"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </div>
                  ) : (
                    <span className="text-purple-500 italic">Select target node...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Node selection grid */}
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
            {nodes.map(node => (
              <div
                key={node.id}
                onClick={() => handleNodeSelect(node)}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                  sourceNode?.id === node.id || targetNode?.id === node.id
                    ? 'border-purple-600 bg-black/60 shadow-md'
                    : 'border-purple-800/30 hover:border-purple-700/50 bg-black/40'
                }`}
                style={{ boxShadow: (sourceNode?.id === node.id || targetNode?.id === node.id) ? '0 0 15px rgba(147, 51, 234, 0.2)' : '' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold ${(sourceNode?.id === node.id || targetNode?.id === node.id) ? 'text-purple-200' : 'text-purple-300'}`}>
                      {node.title}
                    </h3>
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-300 capitalize mt-2 font-medium border border-purple-700/30">
                      {node.category}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    sourceNode?.id === node.id
                      ? 'border-purple-500 bg-purple-600 text-white scale-110 shadow-md'
                      : targetNode?.id === node.id
                        ? 'border-indigo-500 bg-indigo-600 text-white scale-110 shadow-md'
                        : 'border-purple-700/50'
                  }`} style={{ boxShadow: (sourceNode?.id === node.id || targetNode?.id === node.id) ? '0 0 8px rgba(147, 51, 234, 0.4)' : '' }}>
                    {sourceNode?.id === node.id && (
                      <span className="text-xs">1</span>
                    )}
                    {targetNode?.id === node.id && (
                      <span className="text-xs">2</span>
                    )}
                  </div>
                </div>
                <p className={`text-sm mt-2 line-clamp-2 ${(sourceNode?.id === node.id || targetNode?.id === node.id) ? 'text-indigo-300' : 'text-purple-400'}`}>
                  {node.description}
                </p>
                {(sourceNode?.id === node.id || targetNode?.id === node.id) && (
                  <div className="mt-2 text-xs text-indigo-400 flex items-center">
                    <i className="bi bi-check-circle-fill mr-1"></i> 
                    {sourceNode?.id === node.id ? 'Selected as source' : 'Selected as target'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 border-t border-purple-800/30 pt-6">
            <div className="flex justify-between items-center">
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 cursor-pointer"
              >
                <i className="bi bi-x-circle mr-2"></i> Cancel
              </button>
              
              <button
                onClick={() => sourceNode && targetNode && setStep(2)}
                disabled={!sourceNode || !targetNode}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer relative overflow-hidden group"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                <div className="relative z-10">
                  <span>Continue</span>
                  <i className="bi bi-arrow-right ml-2"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Define Relationship */}
      {step === 2 && (
        <div>
          <h3 className="text-xl font-medium text-purple-200 mb-4">Define the Connection</h3>
          
          {/* Selected nodes preview */}
          <div className="mb-6 p-4 bg-black/40 rounded-xl shadow-sm border border-purple-800/30">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(sourceNode.category)}-900/40 text-${getCategoryColor(sourceNode.category)}-400 border border-${getCategoryColor(sourceNode.category)}-700/30`}>
                  <i className={`bi ${getCategoryIcon(sourceNode.category)}`}></i>
                </div>
                <span className="text-purple-300">{sourceNode.title}</span>
              </div>
              
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 border border-purple-700/30">
                <i className="bi bi-arrow-right text-purple-400"></i>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${getCategoryColor(targetNode.category)}-900/40 text-${getCategoryColor(targetNode.category)}-400 border border-${getCategoryColor(targetNode.category)}-700/30`}>
                  <i className={`bi ${getCategoryIcon(targetNode.category)}`}></i>
                </div>
                <span className="text-purple-300">{targetNode.title}</span>
              </div>
            </div>
          </div>

          {/* Relationship Type */}
          <div className="mb-6">
            <label className="block text-purple-200 mb-2">Relationship Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relationshipTypes.map(type => (
                <div
                  key={type.value}
                  onClick={() => setRelationshipType(type.value)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 flex items-center space-x-2 ${
                    relationshipType === type.value
                      ? 'border-purple-600 bg-black/60 shadow-md'
                      : 'border-purple-800/30 hover:border-purple-700/50 bg-black/40'
                  }`}
                  style={{ boxShadow: relationshipType === type.value ? '0 0 15px rgba(147, 51, 234, 0.2)' : '' }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    relationshipType === type.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/60 text-purple-400 border border-purple-700/30'
                  }`}>
                    <i className={`bi ${type.icon}`}></i>
                  </div>
                  <span className={`${relationshipType === type.value ? 'text-purple-200' : 'text-purple-300'}`}>
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Strength */}
          <div className="mb-6">
            <label className="block text-purple-200 mb-2">Connection Strength</label>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 text-sm">Weak</span>
              <div className="flex-1 flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(value => (
                  <div
                    key={value}
                    onClick={() => setStrength(value)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      strength === value
                        ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white transform scale-110'
                        : value <= strength
                          ? 'bg-black/60 text-amber-400 border border-purple-700/30'
                          : 'bg-black/40 text-purple-700 border border-purple-800/30'
                    }`}
                    style={{ boxShadow: strength === value ? '0 0 15px rgba(147, 51, 234, 0.3)' : '' }}
                  >
                    <span className="text-lg">{value}</span>
                  </div>
                ))}
              </div>
              <span className="text-purple-400 text-sm">Strong</span>
            </div>
          </div>

          {/* Connection Description */}
          <div className="mb-6">
            <label className="block text-purple-200 mb-2">Connection Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/60 border border-purple-700/30 text-purple-200 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              rows={4}
              placeholder="Describe how these nodes are connected..."
            ></textarea>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 border-t border-purple-800/30 pt-6">
            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 cursor-pointer"
                >
                  <i className="bi bi-arrow-left mr-2"></i> Back
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 cursor-pointer"
                >
                  <i className="bi bi-arrow-counterclockwise mr-2"></i> Reset
                </button>
              </div>
              
              <button
                onClick={handleCreateConnection}
                disabled={isCreating || !description.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer w-full md:w-auto text-center relative overflow-hidden group"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                <div className="relative z-10">
                  {isCreating ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      <span>Creating Connection...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-link-45deg mr-2"></i>
                      <span>Create Connection</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionCreator
