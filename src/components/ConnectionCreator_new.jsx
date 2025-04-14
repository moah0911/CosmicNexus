import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const ConnectionCreator = ({ nodes, onConnectionCreated, onCancel }) => {
  // State for node selection
  const [sourceNode, setSourceNode] = useState(null)
  const [targetNode, setTargetNode] = useState(null)
  
  // State for connection details
  const [description, setDescription] = useState('')
  const [connectionType, setConnectionType] = useState('related')
  const [strength, setStrength] = useState(3)
  
  // UI state
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState(1) // 1: Select nodes, 2: Define relationship
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredNodes, setFilteredNodes] = useState(nodes)

  // Filter nodes when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNodes(nodes)
      return
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase()
    const filtered = nodes.filter(node => 
      node.title.toLowerCase().includes(lowerSearchTerm) || 
      node.description.toLowerCase().includes(lowerSearchTerm) ||
      node.category.toLowerCase().includes(lowerSearchTerm)
    )
    
    setFilteredNodes(filtered)
  }, [searchTerm, nodes])

  // Generate a default description when nodes are selected
  useEffect(() => {
    if (sourceNode && targetNode) {
      const relationshipLabel = getRelationshipLabel(connectionType)
      setDescription(`${sourceNode.title} ${relationshipLabel} ${targetNode.title} in terms of conceptual frameworks, methodologies, and practical applications.`)
    } else {
      setDescription('')
    }
  }, [sourceNode, targetNode, connectionType])

  // Handle node selection
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

  // Get relationship label for display
  const getRelationshipLabel = (type) => {
    const types = {
      'related': 'is related to',
      'influences': 'influences',
      'inspires': 'inspires',
      'contrasts': 'contrasts with',
      'builds_on': 'builds on',
      'complements': 'complements'
    }
    return types[type] || 'is related to'
  }

  // Create connection directly using Supabase
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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create connection data
      const connectionData = {
        id: uuidv4(),
        user_id: user.id,
        source_node_id: sourceNode.id,
        target_node_id: targetNode.id,
        description: description.trim(),
        strength: strength,
        // Only include relationship_type if it's not the default
        ...(connectionType !== 'related' && { relationship_type: connectionType })
      }

      // Insert connection directly
      const { error } = await supabase
        .from('connections')
        .insert([connectionData])

      if (error) {
        console.error('Error creating connection:', error)
        throw error
      }

      // Add created_at for the client-side
      const newConnection = {
        ...connectionData,
        created_at: new Date().toISOString()
      }

      toast.success('Connection created successfully!')
      onConnectionCreated(newConnection)
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error(error.message || 'Failed to create connection')
    } finally {
      setIsCreating(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setSourceNode(null)
    setTargetNode(null)
    setDescription('')
    setConnectionType('related')
    setStrength(3)
    setStep(1)
    setSearchTerm('')
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div 
      className="connection-creator"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Progress indicator */}
      <motion.div 
        className="flex items-center justify-center mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 1 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-purple-900/50 text-purple-300'
          }`}>
            <span>1</span>
          </div>
          <div className={`h-1 w-16 ${step === 1 ? 'bg-purple-900/50' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 2 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-purple-900/50 text-purple-300'
          }`}>
            <span>2</span>
          </div>
        </div>
      </motion.div>

      {/* Step 1: Node Selection */}
      {step === 1 && (
        <motion.div variants={containerVariants}>
          <motion.h3 
            className="text-xl font-medium text-purple-200 mb-4"
            variants={itemVariants}
          >
            Select Two Knowledge Nodes to Connect
          </motion.h3>
          
          <motion.div 
            className="mb-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/30 text-indigo-300 text-sm"
            variants={itemVariants}
          >
            <p className="flex items-center">
              <i className="bi bi-info-circle mr-2 text-indigo-400"></i>
              Select two different nodes to create a connection between them.
            </p>
          </motion.div>

          {/* Search input */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="bi bi-search text-purple-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-3 rounded-lg border border-purple-700/30 bg-black/60 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
              />
            </div>
          </motion.div>

          {/* Selected nodes preview */}
          {(sourceNode || targetNode) && (
            <motion.div 
              className="mb-6 p-4 bg-black/40 rounded-xl shadow-sm border border-purple-800/30"
              variants={itemVariants}
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.1)' }}
            >
              <h4 className="font-medium text-purple-200 mb-3">Selected Nodes</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1 p-3 rounded-lg bg-black/60 border border-purple-700/30 min-h-[60px] flex items-center">
                  {sourceNode ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-purple-400 border border-purple-700/30">
                        <i className={`bi bi-${getCategoryIcon(sourceNode.category)}`}></i>
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
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-purple-400 border border-purple-700/30">
                        <i className={`bi bi-${getCategoryIcon(targetNode.category)}`}></i>
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
            </motion.div>
          )}

          {/* Node selection grid */}
          <motion.div 
            className="max-h-[400px] overflow-y-auto pr-2 space-y-4"
            variants={containerVariants}
          >
            {filteredNodes.length === 0 ? (
              <motion.div 
                className="p-6 text-center border border-purple-800/30 rounded-xl bg-black/40"
                variants={itemVariants}
              >
                <i className="bi bi-search text-3xl text-purple-400 mb-2"></i>
                <p className="text-purple-300">No nodes match your search criteria</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-3 px-4 py-2 bg-purple-900/40 text-purple-300 rounded-lg border border-purple-700/50 hover:bg-purple-900/60 transition-all duration-300"
                  >
                    <i className="bi bi-x-circle mr-2"></i>
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              filteredNodes.map(node => (
                <motion.div
                  key={node.id}
                  onClick={() => handleNodeSelect(node)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                    sourceNode?.id === node.id || targetNode?.id === node.id
                      ? 'border-purple-600 bg-black/60 shadow-md'
                      : 'border-purple-800/30 hover:border-purple-700/50 bg-black/40'
                  }`}
                  style={{ boxShadow: (sourceNode?.id === node.id || targetNode?.id === node.id) ? '0 0 15px rgba(147, 51, 234, 0.2)' : '' }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
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
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Navigation buttons */}
          <motion.div 
            className="mt-8 border-t border-purple-800/30 pt-6"
            variants={itemVariants}
          >
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
          </motion.div>
        </motion.div>
      )}

      {/* Step 2: Define Relationship */}
      {step === 2 && (
        <motion.div variants={containerVariants}>
          <motion.h3 
            className="text-xl font-medium text-purple-200 mb-4"
            variants={itemVariants}
          >
            Define the Connection
          </motion.h3>
          
          {/* Selected nodes preview */}
          <motion.div 
            className="mb-6 p-4 bg-black/40 rounded-xl shadow-sm border border-purple-800/30"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-purple-400 border border-purple-700/30">
                  <i className={`bi bi-${getCategoryIcon(sourceNode.category)}`}></i>
                </div>
                <span className="text-purple-300">{sourceNode.title}</span>
              </div>
              
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 border border-purple-700/30">
                <i className="bi bi-arrow-right text-purple-400"></i>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-purple-400 border border-purple-700/30">
                  <i className={`bi bi-${getCategoryIcon(targetNode.category)}`}></i>
                </div>
                <span className="text-purple-300">{targetNode.title}</span>
              </div>
            </div>
          </motion.div>

          {/* Relationship Type */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <label className="block text-purple-200 mb-3">Relationship Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'related', label: 'Related', icon: 'link' },
                { value: 'influences', label: 'Influences', icon: 'arrow-right' },
                { value: 'inspires', label: 'Inspires', icon: 'lightbulb' },
                { value: 'contrasts', label: 'Contrasts', icon: 'shuffle' },
                { value: 'builds_on', label: 'Builds On', icon: 'layers' },
                { value: 'complements', label: 'Complements', icon: 'puzzle' }
              ].map(type => (
                <motion.div
                  key={type.value}
                  onClick={() => setConnectionType(type.value)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 flex items-center space-x-2 ${
                    connectionType === type.value
                      ? 'border-purple-600 bg-black/60 shadow-md'
                      : 'border-purple-800/30 hover:border-purple-700/50 bg-black/40'
                  }`}
                  style={{ boxShadow: connectionType === type.value ? '0 0 15px rgba(147, 51, 234, 0.2)' : '' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    connectionType === type.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/60 text-purple-400 border border-purple-700/30'
                  }`}>
                    <i className={`bi bi-${type.icon}`}></i>
                  </div>
                  <span className={`${connectionType === type.value ? 'text-purple-200' : 'text-purple-300'}`}>
                    {type.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Connection Strength */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <label className="block text-purple-200 mb-3">Connection Strength</label>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 text-sm">Weak</span>
              <div className="flex-1 flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(value => (
                  <motion.div
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
                    whileHover={{ scale: strength === value ? 1.15 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{value}</span>
                  </motion.div>
                ))}
              </div>
              <span className="text-purple-400 text-sm">Strong</span>
            </div>
          </motion.div>

          {/* Connection Description */}
          <motion.div 
            className="mb-6"
            variants={itemVariants}
          >
            <label className="block text-purple-200 mb-3">Connection Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-lg bg-black/60 border border-purple-700/30 text-purple-200 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              rows={4}
              placeholder="Describe how these nodes are connected..."
            ></textarea>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div 
            className="mt-8 border-t border-purple-800/30 pt-6"
            variants={itemVariants}
          >
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
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Helper function to get icon for category
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

export default ConnectionCreator