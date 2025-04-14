import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { fetchInterestNodes, generateConnections } from '../services/interestService'

const GenerateInsights = () => {
  const navigate = useNavigate()
  
  // State for nodes and selection
  const [nodes, setNodes] = useState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
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
  const handleNodeSelect = (nodeId) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId)
      } else {
        return [...prev, nodeId]
      }
    })
  }

  // Handle generating insights
  const handleGenerateInsights = async () => {
    if (selectedNodes.length < 2) {
      toast.warning('Please select at least two nodes to generate insights')
      return
    }

    try {
      setIsGenerating(true)

      const { success, discoveryPrompts, error } = await generateConnections(selectedNodes)

      if (success) {
        toast.success('Cosmic insights generated successfully!')
        // Navigate to insights page
        navigate('/insights')
      } else {
        toast.error(error?.message || 'Failed to generate insights')
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
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
          Generate Cosmic Insights
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
          Select at least two knowledge nodes to generate cosmic insights and discover new connections between different areas of your knowledge universe.
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
          <div className="mb-6">
            <h2 className="text-xl font-bold text-purple-200 mb-4">Select Knowledge Nodes for Insights</h2>
            
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
            {selectedNodes.length > 0 && (
              <div className="mb-6 p-4 bg-purple-900/20 rounded-xl border border-purple-800/50">
                <h3 className="text-sm font-medium text-purple-300 mb-3">Selected Nodes: {selectedNodes.length}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNodes.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId)
                    if (!node) return null

                    return (
                      <div
                        key={nodeId}
                        className="flex items-center bg-black/40 px-3 py-1.5 rounded-full border border-purple-700/50 shadow-sm"
                      >
                        <span className="text-sm text-purple-300 font-medium mr-2">{node.title}</span>
                        <button
                          onClick={() => handleNodeSelect(nodeId)}
                          className="text-purple-400 hover:text-purple-300 w-5 h-5 rounded-full flex items-center justify-center hover:bg-purple-900/30 transition-colors cursor-pointer"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    )
                  })}
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
                className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 modal-scrollbar"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredNodes.map(node => (
                  <motion.div
                    key={node.id}
                    onClick={() => handleNodeSelect(node.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedNodes.includes(node.id)
                        ? 'border-purple-600 bg-black/60 shadow-md'
                        : 'border-purple-800/30 hover:border-purple-700/50 bg-black/40'
                    }`}
                    style={{ boxShadow: selectedNodes.includes(node.id) ? '0 0 15px rgba(147, 51, 234, 0.2)' : '' }}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold ${selectedNodes.includes(node.id) ? 'text-purple-200' : 'text-purple-300'}`}>
                          {node.title}
                        </h3>
                        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-300 capitalize mt-2 font-medium border border-purple-700/30">
                          <i className={`bi ${getCategoryIcon(node.category)} mr-1`}></i>
                          {node.category}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        selectedNodes.includes(node.id)
                          ? 'border-purple-500 bg-purple-600 text-white scale-110 shadow-md'
                          : 'border-purple-700/50'
                      }`}>
                        {selectedNodes.includes(node.id) && (
                          <i className="bi bi-check text-xs"></i>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-2 line-clamp-2 ${selectedNodes.includes(node.id) ? 'text-indigo-300' : 'text-purple-400'}`}>
                      {node.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-purple-800/30">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 text-center"
              disabled={isGenerating}
            >
              <i className="bi bi-x-circle mr-2"></i> Cancel
            </button>
            
            <button
              onClick={handleGenerateInsights}
              disabled={isGenerating || selectedNodes.length < 2}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer text-center relative overflow-hidden group"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
              <div className="relative z-10">
                {isGenerating ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                    Generating Cosmic Insights...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lightbulb mr-2"></i>
                    Generate Cosmic Insights
                    {selectedNodes.length >= 2 && (
                      <span className="ml-2 bg-purple-500/30 text-white text-xs px-2 py-0.5 rounded-full">
                        {selectedNodes.length} Selected
                      </span>
                    )}
                  </>
                )}
              </div>
            </button>
          </div>

          {selectedNodes.length < 2 && (
            <p className="text-center text-amber-400 mt-4 text-sm">
              <i className="bi bi-exclamation-triangle mr-1"></i>
              Please select at least 2 nodes to generate insights
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default GenerateInsights
