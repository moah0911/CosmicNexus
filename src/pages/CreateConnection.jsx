import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { fetchInterestNodes, generateConnections } from '../services/interestService'

const CreateConnection = () => {
  const navigate = useNavigate()
  
  // State for nodes and selection
  const [nodes, setNodes] = useState([])
  const [sourceNode, setSourceNode] = useState(null)
  const [targetNode, setTargetNode] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // State for connection details
  const [description, setDescription] = useState('')
  const [connectionType, setConnectionType] = useState('related')
  const [strength, setStrength] = useState(3)
  const [isCreating, setIsCreating] = useState(false)
  
  // State for UI
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredNodes, setFilteredNodes] = useState([])

  // Load nodes on component mount
  useEffect(() => {
    loadNodes()
  }, [])

  // Filter nodes when search term changes
  useEffect(() => {
    if (nodes.length > 0) {
      const filtered = nodes.filter(node => 
        node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredNodes(filtered)
    }
  }, [searchTerm, nodes])

  // Load nodes from API
  const loadNodes = async () => {
    try {
      setLoading(true)
      const { success, data } = await fetchInterestNodes()
      
      if (success) {
        setNodes(data)
        setFilteredNodes(data)
      } else {
        toast.error('Failed to load knowledge nodes')
      }
    } catch (error) {
      console.error('Error loading nodes:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle node selection
  const handleNodeSelect = (node) => {
    if (!sourceNode) {
      setSourceNode(node)
    } else if (!targetNode && node.id !== sourceNode.id) {
      setTargetNode(node)
    } else if (node.id === sourceNode.id) {
      setSourceNode(null)
    } else if (node.id === targetNode.id) {
      setTargetNode(null)
    }
  }

  // Handle connection creation
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
      const connectionOptions = {
        manualDescription: description.trim(),
        strength: strength,
        relationshipType: connectionType
      }

      // Call the API to create the connection
      const { success, connections, error } = await generateConnections(
        [sourceNode.id, targetNode.id],
        connectionOptions
      )

      if (success) {
        toast.success('Connection created successfully!')
        // Navigate back to connections page
        navigate('/connections')
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

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'art': return 'bi-palette'
      case 'science': return 'bi-atom'
      case 'history': return 'bi-hourglass'
      case 'music': return 'bi-music-note-beamed'
      case 'literature': return 'bi-book'
      case 'philosophy': return 'bi-lightbulb'
      case 'technology': return 'bi-cpu'
      case 'hobby': return 'bi-controller'
      default: return 'bi-star'
    }
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}
        >
          Create New Connection
        </motion.h1>
        <motion.p 
          className="text-purple-300 text-lg max-w-3xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}
        >
          Connect two knowledge nodes to discover relationships and insights between different areas of your cosmic universe.
        </motion.p>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-900/50 shadow-xl overflow-hidden"
        style={{ boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)' }}
      >
        <div className="p-6 md:p-8">
          {/* Step 1: Node Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-purple-200 mb-4">Step 1: Select Two Knowledge Nodes to Connect</h2>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your knowledge nodes..."
                  className="w-full px-5 py-3 pl-12 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                />
                <div className="absolute left-3 top-3 text-purple-400">
                  <i className="bi bi-search text-lg"></i>
                </div>
              </div>
            </div>

            {/* Selected Nodes */}
            {(sourceNode || targetNode) && (
              <div className="mb-6 p-4 bg-purple-900/20 rounded-xl border border-purple-800/50">
                <h3 className="text-sm font-medium text-purple-300 mb-3">Selected Nodes:</h3>
                <div className="flex flex-wrap gap-2">
                  {sourceNode && (
                    <div className="flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-purple-700/50 shadow-sm">
                      <span className="text-sm text-purple-300 font-medium mr-2">{sourceNode.title}</span>
                      <button
                        onClick={() => setSourceNode(null)}
                        className="text-purple-400 hover:text-purple-300 w-5 h-5 rounded-full flex items-center justify-center hover:bg-purple-900/30 transition-colors cursor-pointer"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}
                  {targetNode && (
                    <div className="flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-purple-700/50 shadow-sm">
                      <span className="text-sm text-purple-300 font-medium mr-2">{targetNode.title}</span>
                      <button
                        onClick={() => setTargetNode(null)}
                        className="text-purple-400 hover:text-purple-300 w-5 h-5 rounded-full flex items-center justify-center hover:bg-purple-900/30 transition-colors cursor-pointer"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nodes List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredNodes.map(node => (
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
                        <h3 className={`font-bold ${sourceNode?.id === node.id || targetNode?.id === node.id ? 'text-purple-200' : 'text-purple-300'}`}>
                          {node.title}
                        </h3>
                        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-300 capitalize mt-2 font-medium border border-purple-700/30">
                          <i className={`bi ${getCategoryIcon(node.category)} mr-1`}></i>
                          {node.category}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        sourceNode?.id === node.id || targetNode?.id === node.id
                          ? 'border-purple-500 bg-purple-600 text-white scale-110 shadow-md'
                          : 'border-purple-700/50'
                      }`}>
                        {(sourceNode?.id === node.id || targetNode?.id === node.id) && (
                          <i className="bi bi-check text-xs"></i>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-2 line-clamp-2 ${sourceNode?.id === node.id || targetNode?.id === node.id ? 'text-indigo-300' : 'text-purple-400'}`}>
                      {node.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Step 2: Connection Details */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-purple-200 mb-4">Step 2: Define the Connection</h2>
            
            {/* Connection Type */}
            <div className="mb-6">
              <label className="block text-base font-medium text-white mb-2">
                Connection Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'related', label: 'Related', icon: 'bi-link' },
                  { value: 'influences', label: 'Influences', icon: 'bi-arrow-right' },
                  { value: 'contrasts', label: 'Contrasts', icon: 'bi-arrow-left-right' },
                  { value: 'builds_on', label: 'Builds On', icon: 'bi-building-up' }
                ].map(type => (
                  <div
                    key={type.value}
                    onClick={() => setConnectionType(type.value)}
                    className={`flex flex-col items-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                      connectionType === type.value
                        ? 'border-purple-400 bg-black/80 shadow-md scale-105'
                        : 'border-purple-700 hover:border-purple-500 hover:bg-black/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br ${
                      connectionType === type.value
                        ? 'from-purple-600 to-indigo-600'
                        : 'from-gray-700 to-gray-800'
                    } shadow-md`}>
                      <i className={`bi ${type.icon} ${connectionType === type.value ? 'text-white' : 'text-gray-300'} text-lg`}></i>
                    </div>
                    <span className={`text-sm font-medium ${connectionType === type.value ? 'text-purple-300' : 'text-neutral-300'}`}>
                      {type.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Connection Strength */}
            <div className="mb-6">
              <label className="block text-base font-medium text-white mb-2">
                Connection Strength: {strength}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={strength}
                onChange={(e) => setStrength(parseInt(e.target.value))}
                className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-purple-400 mt-1">
                <span>Weak</span>
                <span>Strong</span>
              </div>
            </div>
            
            {/* Connection Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-base font-medium text-white mb-2">
                Connection Description <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-5 py-3 pl-12 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                  placeholder="Describe how these nodes are connected..."
                ></textarea>
                <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <i className="bi bi-link text-white text-sm"></i>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={`${description.length > 500 ? 'text-rose-400' : 'text-purple-400'}`}>
                  {description.length}/500 characters
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-purple-800/30">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 text-center"
              disabled={isCreating}
            >
              <i className="bi bi-x-circle mr-2"></i> Cancel
            </button>
            
            <button
              onClick={handleCreateConnection}
              disabled={isCreating || !sourceNode || !targetNode || !description.trim() || description.length > 500}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer text-center relative overflow-hidden group"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
              <div className="relative z-10">
                {isCreating ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                    Creating Connection...
                  </>
                ) : (
                  <>
                    <i className="bi bi-link mr-2"></i>
                    Create Connection
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateConnection
