import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { fetchInterestNodes, fetchConnections, generateConnections, fetchDiscoveryPrompts, deleteConnection } from '../services/interestService'
import ConnectionCard from '../components/ConnectionCard_new'
import DiscoveryPrompt from '../components/DiscoveryPrompt'
import ConnectionCreator from '../components/ConnectionCreator_new'
import Modal from '../components/Modal'
import { ensureRelationshipTypeColumn } from '../utils/ensureRelationshipTypeColumn'

const Connections = () => {
  // State management
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [discoveryPrompts, setDiscoveryPrompts] = useState([])
  const [filteredConnections, setFilteredConnections] = useState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // UI state
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('connections') // 'connections' or 'discoveries'
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [connectionToDelete, setConnectionToDelete] = useState(null)
  const [generationResults, setGenerationResults] = useState(null)
  const [expandedConnectionId, setExpandedConnectionId] = useState(null)

  // Get all unique categories from nodes
  const categories = useMemo(() => {
    const categorySet = new Set(nodes.map(node => node.category))
    return ['all', ...Array.from(categorySet)].filter(Boolean)
  }, [nodes])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Filter and sort connections when dependencies change
  useEffect(() => {
    filterAndSortConnections()
  }, [connections, searchTerm, filterCategory, sortBy])

  // Load all data from the API
  const loadData = async () => {
    try {
      setLoading(true)

      // Ensure the relationship_type column exists
      await ensureRelationshipTypeColumn()

      // Fetch all data in parallel for better performance
      const [nodesResult, connectionsResult, promptsResult] = await Promise.all([
        fetchInterestNodes(),
        fetchConnections(),
        fetchDiscoveryPrompts()
      ])

      if (nodesResult.success) {
        setNodes(nodesResult.data)
      }

      if (connectionsResult.success) {
        setConnections(connectionsResult.data)
      }

      if (promptsResult.success) {
        setDiscoveryPrompts(promptsResult.data)
      }
    } catch (error) {
      console.error('Error loading connections data:', error)
      toast.error('Failed to load your data')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort connections based on user selections
  const filterAndSortConnections = useCallback(() => {
    let filtered = [...connections]

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(connection => {
        const sourceNode = nodes.find(node => node.id === connection.source_node_id)
        const targetNode = nodes.find(node => node.id === connection.target_node_id)

        return (
          sourceNode?.title.toLowerCase().includes(lowerSearchTerm) ||
          targetNode?.title.toLowerCase().includes(lowerSearchTerm) ||
          connection.description.toLowerCase().includes(lowerSearchTerm)
        )
      })
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(connection => {
        const sourceNode = nodes.find(node => node.id === connection.source_node_id)
        const targetNode = nodes.find(node => node.id === connection.target_node_id)

        return (
          sourceNode?.category === filterCategory ||
          targetNode?.category === filterCategory
        )
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'strength-high':
        filtered.sort((a, b) => b.strength - a.strength)
        break
      case 'strength-low':
        filtered.sort((a, b) => a.strength - b.strength)
        break
      case 'alphabetical':
        filtered.sort((a, b) => {
          const sourceNodeA = nodes.find(node => node.id === a.source_node_id)
          const sourceNodeB = nodes.find(node => node.id === b.source_node_id)
          return sourceNodeA?.title.localeCompare(sourceNodeB?.title)
        })
        break
      default:
        break
    }

    setFilteredConnections(filtered)
  }, [connections, nodes, searchTerm, filterCategory, sortBy])

  // Handle node selection for generating connections
  const handleNodeSelect = (nodeId) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId)
      } else {
        return [...prev, nodeId]
      }
    })
  }

  // Generate connections between selected nodes
  const handleGenerateConnections = async () => {
    if (selectedNodes.length < 2) {
      toast.warning('Please select at least two interests to find connections')
      return
    }

    try {
      setIsGenerating(true)

      const { success, connections, discoveryPrompts, error } = await generateConnections(selectedNodes)

      if (success) {
        setGenerationResults({
          connections,
          discoveryPrompts
        })

        // Update the connections list
        loadData()

        // Show results modal
        setIsResultsModalOpen(true)
        setIsSelectModalOpen(false)

        toast.success('Connections generated successfully!')
      } else {
        toast.error(error.message || 'Failed to generate connections')
      }
    } catch (error) {
      console.error('Error generating connections:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  // Find nodes for a connection
  const getNodesForConnection = (connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source_node_id)
    const targetNode = nodes.find(node => node.id === connection.target_node_id)
    return { sourceNode, targetNode }
  }

  // Handle manual connection creation
  const handleConnectionCreated = (newConnection) => {
    // Add the new connection to the state
    setConnections(prev => [newConnection, ...prev])
    // Close the modal
    setIsCreateModalOpen(false)
    // Show success message
    toast.success('Connection created successfully!')
  }

  // Handle connection deletion
  const handleDeleteConnection = async () => {
    if (!connectionToDelete) return

    try {
      const { success, error } = await deleteConnection(connectionToDelete.id)

      if (success) {
        // Remove the connection from state
        setConnections(prev => prev.filter(conn => conn.id !== connectionToDelete.id))
        // Close the modal
        setIsDeleteModalOpen(false)
        // Reset the connection to delete
        setConnectionToDelete(null)
        // Show success message
        toast.success('Connection deleted successfully')
      } else {
        toast.error(error?.message || 'Failed to delete connection')
      }
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast.error('An unexpected error occurred')
    }
  }

  // Toggle connection expansion
  const toggleConnectionExpansion = (connectionId) => {
    setExpandedConnectionId(prev => prev === connectionId ? null : connectionId)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white relative overflow-hidden mb-6"
            style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}>
            <i className="bi bi-diagram-3 text-3xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-2xl font-medium text-purple-200 mb-2">Loading Cosmic Connections</h2>
          <p className="text-purple-400">Mapping your knowledge universe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute h-64 w-64 rounded-full border-2 border-purple-500/20 top-10 -left-20 animate-spin-slow"></div>
        <div className="absolute h-96 w-96 rounded-full border-2 border-indigo-500/20 bottom-10 -right-40 animate-spin-slow" style={{ animationDuration: '120s' }}></div>
        <div className="absolute h-40 w-40 rounded-full border-2 border-purple-500/20 bottom-40 left-1/4 animate-spin-slow" style={{ animationDuration: '80s' }}></div>
        <div className="absolute h-20 w-20 rounded-full bg-purple-600/10 animate-float" style={{ top: '10%', right: '5%', animationDelay: '0s' }}></div>
        <div className="absolute h-32 w-32 rounded-full bg-indigo-600/10 animate-float" style={{ top: '60%', left: '15%', animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Cosmic Connections
        </motion.div>
        <motion.h1
          className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Connections & Discoveries
        </motion.h1>
        <motion.p
          className="text-lg text-purple-300 max-w-3xl"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Explore the cosmic web connecting your knowledge nodes and discover new celestial paths for exploration.
        </motion.p>
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-3 rounded-t-xl font-medium transition-all duration-300 ${
              activeTab === 'connections'
                ? 'bg-black/60 text-purple-300 border-t border-l border-r border-purple-700/50'
                : 'bg-black/30 text-purple-400 hover:bg-black/40'
            }`}
          >
            <i className="bi bi-diagram-3 mr-2"></i>
            Connections
            <span className="ml-2 bg-purple-900/60 text-purple-300 text-xs px-2 py-0.5 rounded-full">
              {connections.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('discoveries')}
            className={`px-6 py-3 rounded-t-xl font-medium transition-all duration-300 ${
              activeTab === 'discoveries'
                ? 'bg-black/60 text-indigo-300 border-t border-l border-r border-indigo-700/50'
                : 'bg-black/30 text-indigo-400 hover:bg-black/40'
            }`}
          >
            <i className="bi bi-stars mr-2"></i>
            Discoveries
            <span className="ml-2 bg-indigo-900/60 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
              {discoveryPrompts.length}
            </span>
          </button>
        </div>

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            {/* Controls */}
            <div className="bg-black/40 border border-purple-800/30 p-6 rounded-xl shadow-md mb-8"
              style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-purple-200 mb-2">Your Cosmic Connections</h2>
                  <p className="text-purple-300">
                    <span className="font-bold text-indigo-300">{connections.length}</span> connection{connections.length !== 1 ? 's' : ''} found between your knowledge nodes
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px] flex items-center hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                    style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
                  >
                    <i className="bi bi-link-45deg mr-2"></i>
                    <span>Create Manual Connection</span>
                  </button>

                  <button
                    onClick={() => setIsSelectModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px] flex items-center hover:from-purple-600 hover:to-indigo-600 cursor-pointer"
                    style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
                  >
                    <i className="bi bi-stars mr-2"></i>
                    <span>Discover AI Connections</span>
                  </button>
                </div>
              </div>

              {/* Filters and search */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-search text-purple-400"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Search connections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 rounded-lg border border-purple-700/30 bg-black/60 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-filter text-purple-400"></i>
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-10 w-full px-4 py-2 rounded-lg border border-purple-700/30 bg-black/60 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 appearance-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <i className="bi bi-chevron-down text-purple-400"></i>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-sort-down text-purple-400"></i>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 w-full px-4 py-2 rounded-lg border border-purple-700/30 bg-black/60 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 appearance-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="strength-high">Strongest First</option>
                    <option value="strength-low">Weakest First</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <i className="bi bi-chevron-down text-purple-400"></i>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                        : 'bg-black/40 text-purple-400 border-purple-800/30 hover:bg-purple-900/20'
                    }`}
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                        : 'bg-black/40 text-purple-400 border-purple-800/30 hover:bg-purple-900/20'
                    }`}
                  >
                    <i className="bi bi-list-ul"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Connections List */}
            {connections.length === 0 ? (
              <div className="bg-black/40 rounded-2xl shadow-xl p-10 text-center mb-12 border border-purple-800/30"
                style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                  style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
                  <i className="bi bi-link-45deg text-4xl text-purple-300 relative z-10"></i>
                  <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                    style={{
                      animationDuration: '3s',
                      boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                    }}>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-purple-200 mb-3">No Cosmic Connections Yet</h3>
                <p className="text-purple-300 mb-6 max-w-lg mx-auto">
                  Select multiple knowledge nodes to discover the cosmic threads that connect them across your intellectual universe.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px] hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                    style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
                  >
                    <i className="bi bi-link-45deg mr-2"></i> Create Manual Connection
                  </button>

                  <button
                    onClick={() => setIsSelectModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px] hover:from-purple-600 hover:to-indigo-600 cursor-pointer"
                    style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
                  >
                    <i className="bi bi-stars mr-2"></i> Discover AI Connections
                  </button>
                </div>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="bg-black/40 rounded-2xl shadow-xl p-8 text-center mb-12 border border-purple-800/30"
                style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
                <i className="bi bi-search text-4xl text-purple-400 mb-3"></i>
                <h3 className="text-xl font-bold text-purple-200 mb-2">No Matching Connections</h3>
                <p className="text-purple-300 mb-4">
                  No connections match your current search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterCategory('all')
                    setSortBy('newest')
                  }}
                  className="px-4 py-2 bg-purple-900/40 text-purple-300 rounded-lg border border-purple-700/50 hover:bg-purple-900/60 transition-all duration-300"
                >
                  <i className="bi bi-arrow-counterclockwise mr-2"></i>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-12' : 'space-y-6 mb-12'}>
                <AnimatePresence>
                  {filteredConnections.map(connection => {
                    const { sourceNode, targetNode } = getNodesForConnection(connection)
                    if (!sourceNode || !targetNode) return null;

                    return (
                      <ConnectionCard
                        key={connection.id}
                        connection={connection}
                        sourceNode={sourceNode}
                        targetNode={targetNode}
                        onDelete={(conn) => {
                          setConnectionToDelete(conn)
                          setIsDeleteModalOpen(true)
                        }}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Discoveries Tab */}
        {activeTab === 'discoveries' && (
          <div>
            {/* Controls */}
            <div className="bg-black/40 border border-indigo-800/30 p-6 rounded-xl shadow-md mb-8"
              style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-200 mb-2">Cosmic Discoveries</h2>
                  <p className="text-indigo-300">
                    <span className="font-bold text-indigo-300">{discoveryPrompts.length}</span> celestial insight{discoveryPrompts.length !== 1 ? 's' : ''} to explore
                  </p>
                </div>

                <button
                  onClick={() => setIsSelectModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px] flex items-center hover:from-indigo-600 hover:to-purple-600 cursor-pointer mt-4 md:mt-0"
                  style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
                >
                  <i className="bi bi-stars mr-2"></i>
                  <span>Generate New Discoveries</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="bi bi-search text-indigo-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search discoveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 rounded-lg border border-indigo-700/30 bg-black/60 text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Discovery Prompts */}
            {discoveryPrompts.length === 0 ? (
              <div className="bg-black/40 rounded-2xl shadow-xl p-10 text-center border border-indigo-800/30"
                style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' }}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-800 to-purple-800 flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                  style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
                  <i className="bi bi-stars text-4xl text-indigo-300 relative z-10"></i>
                  <div className="absolute inset-0 bg-indigo-500 opacity-0 animate-pulse"
                    style={{
                      animationDuration: '3s',
                      boxShadow: 'inset 0 0 20px rgba(165, 180, 252, 0.5)'
                    }}>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-indigo-200 mb-3">No Cosmic Discoveries Yet</h3>
                <p className="text-indigo-300 mb-6 max-w-lg mx-auto">
                  Generate AI-powered cosmic discoveries to explore new dimensions and uncharted territories in your knowledge universe.
                </p>
                <button
                  onClick={() => setIsSelectModalOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-2px] hover:from-indigo-600 hover:to-purple-600 cursor-pointer"
                  style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
                >
                  <i className="bi bi-stars mr-2"></i> Generate AI Discoveries
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {discoveryPrompts
                    .filter(prompt =>
                      !searchTerm ||
                      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (prompt.related_nodes && prompt.related_nodes.some(node =>
                        node.toLowerCase().includes(searchTerm.toLowerCase())
                      ))
                    )
                    .map(prompt => (
                      <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <DiscoveryPrompt
                          prompt={prompt}
                          onDelete={(deletedId) => {
                            // Update the state to remove the deleted prompt
                            setDiscoveryPrompts(prevPrompts => prevPrompts.filter(p => p.id !== deletedId));
                            // Show success message
                            toast.success('Cosmic Discovery deleted successfully');
                          }}
                        />
                      </motion.div>
                    ))
                  }
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Select Interests Modal */}
      <Modal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Select Knowledge Nodes to Connect"
      >
        <div>
          <p className="text-lg text-purple-300 mb-6 border-l-4 border-purple-600 pl-4 py-2 bg-purple-900/30 rounded-r-lg">
            Select at least two knowledge nodes to discover cosmic connections and generate celestial insights.
          </p>
          <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/30 text-indigo-300 text-sm">
            <p className="flex items-center">
              <i className="bi bi-info-circle mr-2 text-indigo-400"></i>
              Click on any node below to select it. You need to select at least 2 nodes to discover connections.
            </p>
          </div>

          {selectedNodes.length > 0 && (
            <div className="mb-6 p-4 bg-black/40 rounded-xl shadow-sm border border-purple-800/30"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.1)' }}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-purple-200 flex items-center">
                  <i className="bi bi-stars mr-2 text-indigo-400"></i>
                  <span>{selectedNodes.length} Cosmic Node{selectedNodes.length !== 1 ? 's' : ''} Selected</span>
                </h3>
                <button
                  onClick={() => setSelectedNodes([])}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-900/30 transition-colors duration-300 cursor-pointer"
                >
                  <i className="bi bi-x-circle mr-1"></i> Clear All
                </button>
              </div>

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

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
            {nodes.map(node => (
              <div
                key={node.id}
                onClick={() => handleNodeSelect(node.id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedNodes.includes(node.id)
                    ? 'border-purple-600 bg-black/60 shadow-md'
                    : 'border-purple-800/30 hover:border-purple-700/50 bg-black/40'
                }`}
                style={{ boxShadow: selectedNodes.includes(node.id) ? '0 0 15px rgba(147, 51, 234, 0.2)' : '' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold ${selectedNodes.includes(node.id) ? 'text-purple-200' : 'text-purple-300'}`}>
                      {node.title}
                    </h3>
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-300 capitalize mt-2 font-medium border border-purple-700/30">
                      {node.category}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    selectedNodes.includes(node.id)
                      ? 'border-purple-500 bg-purple-600 text-white scale-110 shadow-md'
                      : 'border-purple-700/50'
                  }`} style={{ boxShadow: selectedNodes.includes(node.id) ? '0 0 8px rgba(147, 51, 234, 0.4)' : '' }}>
                    {selectedNodes.includes(node.id) && (
                      <i className="bi bi-check text-xs"></i>
                    )}
                  </div>
                </div>
                <p className={`text-sm mt-2 line-clamp-2 ${selectedNodes.includes(node.id) ? 'text-indigo-300' : 'text-purple-400'}`}>
                  {node.description}
                </p>
                {selectedNodes.includes(node.id) && (
                  <div className="mt-2 text-xs text-indigo-400 flex items-center">
                    <i className="bi bi-check-circle-fill mr-1"></i> Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-purple-800/30 pt-6">
            <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4">
              <button
                onClick={() => setIsSelectModalOpen(false)}
                className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 cursor-pointer w-full md:w-auto text-center"
              >
                <i className="bi bi-x-circle mr-2"></i> Cancel
              </button>

              <button
                onClick={handleGenerateConnections}
                disabled={selectedNodes.length < 2 || isGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer w-full md:w-auto text-center relative overflow-hidden group"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                <div className="relative z-10">
                  {isGenerating ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      <span>Exploring Cosmic Connections...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-stars mr-2"></i>
                      <span>Discover Cosmic Connections</span>
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
                Please select at least 2 nodes to discover connections
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        title="Cosmic Connections Discovered"
      >
        {generationResults && (
          <div>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center shadow-md mr-3 relative overflow-hidden"
                  style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.3)' }}>
                  <i className="bi bi-link-45deg text-white relative z-10"></i>
                  <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                    style={{
                      animationDuration: '3s',
                      boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                    }}>
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-400"
                  style={{
                    textShadow: '0 0 10px rgba(147, 51, 234, 0.3)',
                    letterSpacing: '0.03em'
                  }}>
                  Cosmic Connections Found
                </h3>
              </div>

              {generationResults.connections.length === 0 ? (
                <div className="p-5 border border-purple-800/30 rounded-xl bg-black/40 text-center"
                  style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.1)' }}>
                  <i className="bi bi-search text-3xl text-purple-400 mb-2"></i>
                  <p className="text-purple-300">
                    No direct connections were found between these knowledge nodes. Try selecting different nodes to explore other cosmic pathways.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                  {generationResults.connections.map((conn, index) => (
                    <div key={index} className="p-4 border border-purple-800/30 rounded-xl bg-black/40 shadow-sm hover:shadow-md transition-all duration-300"
                      style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.05)' }}>
                      <div className="flex items-center text-sm text-purple-300 mb-2">
                        <span className="font-bold px-3 py-1 bg-purple-900/40 rounded-full border border-purple-700/30">{conn.sourceName}</span>
                        <div className="mx-2 h-0.5 w-6 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        <span className="font-bold px-3 py-1 bg-indigo-900/40 rounded-full border border-indigo-700/30">{conn.targetName}</span>
                      </div>
                      <p className="text-purple-200">{conn.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center shadow-md mr-3 relative overflow-hidden"
                  style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' }}>
                  <i className="bi bi-stars text-white relative z-10"></i>
                  <div className="absolute inset-0 bg-indigo-500 opacity-0 animate-pulse"
                    style={{
                      animationDuration: '3s',
                      boxShadow: 'inset 0 0 20px rgba(165, 180, 252, 0.5)'
                    }}>
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400"
                  style={{
                    textShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
                    letterSpacing: '0.03em'
                  }}>
                  Celestial Discoveries
                </h3>
              </div>

              {generationResults.discoveryPrompts.length === 0 ? (
                <div className="p-5 border border-indigo-800/30 rounded-xl bg-black/40 text-center"
                  style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)' }}>
                  <i className="bi bi-search text-3xl text-indigo-400 mb-2"></i>
                  <p className="text-indigo-300">
                    No cosmic discoveries were generated for these knowledge nodes. Try exploring different combinations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                  {generationResults.discoveryPrompts.map((prompt, index) => (
                    <div key={index} className="p-4 bg-black/40 rounded-xl border border-indigo-800/30 shadow-sm"
                      style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.05)' }}>
                      <p className="text-indigo-300 font-serif italic text-lg">"{prompt.content}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-purple-800/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-purple-300 text-sm">
                <i className="bi bi-info-circle mr-1"></i>
                These connections have been saved to your cosmic web
              </p>
              <button
                onClick={() => setIsResultsModalOpen(false)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:from-purple-600 hover:to-indigo-600 cursor-pointer w-full md:w-auto text-center relative overflow-hidden group"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                <div className="relative z-10">
                  <i className="bi bi-check-circle mr-2"></i> Continue Exploration
                </div>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Connection Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Cosmic Connection"
      >
        <ConnectionCreator
          nodes={nodes}
          onConnectionCreated={handleConnectionCreated}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Delete Connection Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Cosmic Connection"
      >
        <div>
          <div className="p-4 bg-black/40 rounded-xl shadow-sm border border-red-800/30 mb-6"
            style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.1)' }}>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center mr-3 relative overflow-hidden"
                style={{ boxShadow: '0 0 10px rgba(220, 38, 38, 0.3)' }}>
                <i className="bi bi-exclamation-triangle text-red-300 relative z-10"></i>
                <div className="absolute inset-0 bg-red-500 opacity-0 animate-pulse"
                  style={{
                    animationDuration: '3s',
                    boxShadow: 'inset 0 0 20px rgba(248, 113, 113, 0.5)'
                  }}>
                </div>
              </div>
              <h3 className="font-bold text-red-300">Confirm Deletion</h3>
            </div>
            <p className="text-red-400 text-sm leading-relaxed">
              Are you sure you want to delete this Cosmic Connection? This action cannot be undone and the connection will be permanently removed from your collection.
            </p>
          </div>

          {connectionToDelete && (
            <div className="bg-black/60 p-5 rounded-xl shadow-sm border border-purple-800/30 mb-6">
              <div className="flex items-center flex-wrap gap-2 mb-3">
                {(() => {
                  const { sourceNode, targetNode } = getNodesForConnection(connectionToDelete);
                  if (!sourceNode || !targetNode) return null;

                  return (
                    <>
                      <span className="font-medium text-purple-300">{sourceNode.title}</span>
                      <div className="px-3 py-1 rounded-full bg-black/60 border border-purple-700/30 text-purple-400 text-sm">
                        <i className={`bi bi-${getRelationshipIcon(connectionToDelete.relationship_type)} mr-1`}></i>
                        <span className="capitalize">{formatRelationshipType(connectionToDelete.relationship_type)}</span>
                      </div>
                      <span className="font-medium text-purple-300">{targetNode.title}</span>
                    </>
                  );
                })()}
              </div>
              <p className="text-purple-300">{connectionToDelete.description}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300"
            >
              <i className="bi bi-arrow-left mr-2"></i> Keep Connection
            </button>
            <button
              onClick={handleDeleteConnection}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700"
              style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.3)' }}
            >
              <i className="bi bi-trash mr-2"></i> Delete Forever
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Connections