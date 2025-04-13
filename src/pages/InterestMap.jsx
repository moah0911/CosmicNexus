import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { fetchInterestNodes, createInterestNode, updateInterestNode, deleteInterestNode, fetchConnections, generateConnections, deleteConnection } from '../services/interestService'
import InterestNode from '../components/InterestNode'
import Modal from '../components/Modal'
import InterestNodeForm from '../components/InterestNodeForm'
// import GraphView from '../components/GraphView' // Using SimpleGraphView instead
import SimpleGraphView from '../components/SimpleGraphView'
import BasicGraphView from '../components/BasicGraphView'
import AnimatedButton from '../components/AnimatedButton'
import AnimatedLoader from '../components/AnimatedLoader'

const CosmicKnowledgeNexus = () => { // Renamed from InterestMap
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [editingNode, setEditingNode] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState(null)
  const [viewMode, setViewMode] = useState('graph') // 'grid' or 'graph'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Add debug message
      console.log("Starting to load data for InterestMap");
      
      // Load nodes first
      const nodesResult = await fetchInterestNodes();
      console.log("Nodes API response:", nodesResult);
      
      if (nodesResult.success && Array.isArray(nodesResult.data)) {
        console.log("Loaded nodes:", nodesResult.data);
        setNodes(nodesResult.data);
      } else {
        console.error("Failed to load nodes:", nodesResult.error || "Invalid data format");
        setNodes([]);
        toast.error(nodesResult.error?.message || 'Failed to load interests');
      }
      
      // Then load connections
      const connectionsResult = await fetchConnections();
      console.log("Connections API response:", connectionsResult);
      
      if (connectionsResult.success && Array.isArray(connectionsResult.data)) {
        console.log("Loaded connections:", connectionsResult.data);
        setConnections(connectionsResult.data);
      } else {
        console.error("Failed to load connections:", connectionsResult.error || "Invalid data format");
        setConnections([]);
        toast.error(connectionsResult.error?.message || 'Failed to load connections');
      }
      
      // Add debug message after loading
      console.log("Finished loading data for InterestMap", {
        nodesLoaded: nodesResult.success && Array.isArray(nodesResult.data) ? nodesResult.data.length : 0,
        connectionsLoaded: connectionsResult.success && Array.isArray(connectionsResult.data) ? connectionsResult.data.length : 0
      });
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddNode = async (nodeData) => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Creating your cosmic node...');
      
      // Call API to create node
      const { success, data, error, duplicates } = await createInterestNode(nodeData);
      
      if (success) {
        // Update state with new node
        setNodes(prev => [data, ...prev]);
        
        // Close modal first
        setIsAddModalOpen(false);
        
        // Then show success message
        setTimeout(() => {
          toast.dismiss(loadingToastId);
          toast.success('Cosmic node created successfully!');
        }, 300);
      } else {
        toast.dismiss(loadingToastId);
        
        // Handle duplicate node error specifically
        if (duplicates && duplicates.length > 0) {
          const duplicateTitle = duplicates[0].title;
          toast.error(
            <div>
              <p>A node with a similar title already exists:</p>
              <p className="font-semibold mt-1">"{duplicateTitle}"</p>
              <p className="text-sm mt-2">Please use a different title.</p>
            </div>,
            { autoClose: 5000 }
          );
        } else {
          // Handle other errors
          toast.error(error?.message || 'Failed to create cosmic node');
        }
      }
    } catch (error) {
      console.error('Error adding node:', error);
      toast.error('An unexpected error occurred');
    }
  }
  
  const handleUpdateNode = async (nodeData) => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Updating your cosmic node...');
      
      // Call API to update node
      const { success, data, error, duplicates } = await updateInterestNode(editingNode.id, nodeData);
      
      if (success) {
        // Update state with updated node
        setNodes(prev => prev.map(node => node.id === data.id ? data : node));
        
        // Close modal first
        setIsEditModalOpen(false);
        setEditingNode(null);
        
        // Then show success message
        setTimeout(() => {
          toast.dismiss(loadingToastId);
          toast.success('Cosmic node updated successfully!');
        }, 300);
      } else {
        toast.dismiss(loadingToastId);
        
        // Handle duplicate node error specifically
        if (duplicates && duplicates.length > 0) {
          const duplicateTitle = duplicates[0].title;
          toast.error(
            <div>
              <p>A node with a similar title already exists:</p>
              <p className="font-semibold mt-1">"{duplicateTitle}"</p>
              <p className="text-sm mt-2">Please use a different title.</p>
            </div>,
            { autoClose: 5000 }
          );
        } else {
          // Handle other errors
          toast.error(error?.message || 'Failed to update cosmic node');
        }
      }
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error('An unexpected error occurred');
    }
  }
  
  const handleDeleteNode = async () => {
    if (!nodeToDelete) return
    
    try {
      const { success, error } = await deleteInterestNode(nodeToDelete)
      
      if (success) {
        setNodes(prev => prev.filter(node => node.id !== nodeToDelete))
        setSelectedNodes(prev => prev.filter(id => id !== nodeToDelete))
        toast.success('Node deleted successfully!')
        setIsDeleteModalOpen(false)
        setNodeToDelete(null)
      } else {
        toast.error(error.message || 'Failed to delete node')
      }
    } catch (error) {
      console.error('Error deleting node:', error)
      toast.error('An unexpected error occurred')
    }
  }
  
  const handleDeleteConnection = async (connectionId) => {
    try {
      const { success, error } = await deleteConnection(connectionId)
      
      if (success) {
        setConnections(prev => prev.filter(conn => conn.id !== connectionId))
        toast.success('Connection deleted successfully!')
      } else {
        toast.error(error?.message || 'Failed to delete connection')
      }
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast.error('An unexpected error occurred')
    }
  }
  
  // Handle manual connection creation
  const handleCreateConnection = async (sourceNodeId, targetNodeId) => {
    try {
      setLoading(true)
      
      // Get the node objects
      const sourceNode = nodes.find(n => n.id === sourceNodeId)
      const targetNode = nodes.find(n => n.id === targetNodeId)
      
      if (!sourceNode || !targetNode) {
        toast.error('Invalid nodes selected')
        return
      }
      
      // Create a default description for the connection
      const description = `Connection between ${sourceNode.title} and ${targetNode.title}`
      
      // Call the API to create the connection
      const { success, connections, error } = await generateConnections(
        [sourceNodeId, targetNodeId], 
        { manualDescription: description }
      )
      
      if (success) {
        toast.success('Connection created successfully')
        await loadData()
      } else {
        toast.error(error?.message || 'Failed to create connection')
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleNodeSelect = (nodeId) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId)
      } else {
        return [...prev, nodeId]
      }
    })
  }
  
  const handleEditClick = (node) => {
    setEditingNode(node)
    setIsEditModalOpen(true)
  }
  
  const handleDeleteClick = (nodeId) => {
    setNodeToDelete(nodeId)
    setIsDeleteModalOpen(true)
  }
  
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || node.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })
  
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'art', label: 'Art & Design' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'music', label: 'Music' },
    { value: 'literature', label: 'Literature' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'technology', label: 'Technology' },
    { value: 'hobby', label: 'Hobby' },
    { value: 'general', label: 'General' }
  ]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black bg-opacity-70">
        <div className="relative">
          {/* Sparkle effects */}
          <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '-20px', left: '20px', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30px', left: '80px', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70px', left: '-15px', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
          <AnimatedLoader message="Aligning cosmic knowledge" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-black bg-opacity-80 min-h-screen p-6 relative">
      {/* Background sparkle effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70%', left: '15%', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '1.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ top: '80%', left: '75%', animationDelay: '0.3s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
      </div>
      <motion.div 
        className="mb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-900 to-indigo-800 flex items-center justify-center text-white overflow-hidden relative"
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(147, 51, 234, 0.7)"
            }}
          >
            <motion.i 
              className="bi bi-stars text-2xl relative z-10"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
            <motion.div 
              className="absolute inset-0 bg-purple-500 opacity-0"
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          <div>
            <motion.h1 
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ 
                textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
                letterSpacing: '0.05em'
              }}
            >
              Cosmic Knowledge Nexus
            </motion.h1>
          </div>
        </div>
        
        <motion.p 
          className="text-purple-300 text-lg mt-2 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ 
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}
        >
          <span className="text-indigo-300 font-medium">Explore the celestial web</span> of your interconnected ideas and <span className="text-indigo-300 font-medium">discover cosmic patterns</span> between concepts in your personal universe of knowledge.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-4"
        >
          <Link 
            to="/explorer"
            className="px-4 py-2 rounded-full border border-purple-700 text-purple-300 hover:text-white relative overflow-hidden group transition-all duration-300 hover:border-purple-500 inline-flex items-center"
            style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)' }}
          >
            <span className="relative z-10 transition-colors duration-300">Try the new Cosmic Explorer</span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative z-10">New</span>
            <i className="bi bi-arrow-right ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1"></i>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-80"></span>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Controls */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <motion.div 
            className="relative flex-grow"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <input
              type="text"
              placeholder="Search cosmic nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 rounded-full bg-black bg-opacity-60 border border-purple-800 focus:border-purple-500 text-purple-200 w-full shadow-lg focus:shadow-purple-900/50 transition-all outline-none"
              style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)' }}
            />
            <motion.i 
              className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
              animate={{ rotate: searchQuery ? [0, 15, 0, -15, 0] : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.div>
          
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pr-10 py-2 rounded-full bg-black bg-opacity-60 border border-purple-800 focus:border-purple-500 text-purple-200 shadow-lg focus:shadow-purple-900/50 transition-all outline-none appearance-none"
              style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)' }}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value} className="bg-gray-900 text-purple-200">
                  {category.label}
                </option>
              ))}
            </select>
            <motion.i 
              className="bi bi-funnel absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
              animate={{ 
                rotate: categoryFilter !== 'all' ? [0, 15, 0] : 0,
                scale: categoryFilter !== 'all' ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
          <motion.div 
            className="flex border border-purple-800 rounded-full overflow-hidden shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.3)' }}
          >
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 flex items-center ${
                viewMode === 'grid' 
                  ? 'bg-purple-800 text-white font-medium' 
                  : 'bg-black bg-opacity-60 text-purple-300 hover:bg-purple-900 hover:bg-opacity-30'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.i 
                className="bi bi-grid mr-2"
                animate={{ 
                  rotate: viewMode === 'grid' ? [0, 10, 0, -10, 0] : 0 
                }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-sm">Grid</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 flex items-center ${
                viewMode === 'graph' 
                  ? 'bg-purple-800 text-white font-medium' 
                  : 'bg-black bg-opacity-60 text-purple-300 hover:bg-purple-900 hover:bg-opacity-30'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.i 
                className="bi bi-diagram-3 mr-2"
                animate={{ 
                  rotate: viewMode === 'graph' ? [0, 10, 0, -10, 0] : 0 
                }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-sm">Graph</span>
            </motion.button>
          </motion.div>
          
          <AnimatedButton
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            icon={<i className="bi bi-plus-lg"></i>}
          >
            Add Node
          </AnimatedButton>
        </div>
      </motion.div>
      
      {/* Selected Nodes */}
      <AnimatePresence>
        {selectedNodes.length > 0 && (
          <motion.div 
            className="mb-6 p-5 bg-primary-50 rounded-lg border border-primary-200 shadow-md"
            initial={{ opacity: 0, y: -20, height: 0, padding: 0, margin: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto', padding: 20, marginBottom: 24 }}
            exit={{ opacity: 0, y: -20, height: 0, padding: 0, margin: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 overflow-hidden"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <motion.i 
                    className="bi bi-check2-circle text-primary-600"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  />
                </motion.div>
                <motion.h3 
                  className="font-medium text-primary-800 text-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {selectedNodes.length} {selectedNodes.length === 1 ? 'Node' : 'Nodes'} Selected
                </motion.h3>
              </div>
              <motion.button
                onClick={() => setSelectedNodes([])}
                className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <i className="bi bi-x-circle mr-1"></i>
                Clear Selection
              </motion.button>
            </div>
            
            <motion.div 
              className="flex flex-wrap gap-2 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {selectedNodes.map((nodeId, index) => {
                const node = nodes.find(n => n.id === nodeId)
                if (!node) return null
                
                return (
                  <motion.div 
                    key={nodeId}
                    className="flex items-center bg-white px-3 py-1.5 rounded-full border border-primary-200 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  >
                    <motion.div 
                      className={`w-4 h-4 rounded-full bg-${node.category === 'general' ? 'gray' : node.category}-500 mr-2`}
                      whileHover={{ scale: 1.2 }}
                    />
                    <span className="text-sm text-neutral-700 mr-2">{node.title}</span>
                    <motion.button
                      onClick={() => handleNodeSelect(nodeId)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="bi bi-x"></i>
                    </motion.button>
                  </motion.div>
                )
              })}
              {selectedNodes.length >= 2 && (
                <motion.div 
                  className="mt-4 pt-3 border-t border-primary-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="flex justify-between items-center">
                    <motion.p 
                      className="text-sm text-primary-700"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <i className="bi bi-info-circle mr-1"></i>
                      AI will analyze these nodes and find meaningful connections between them.
                    </motion.p>
                    <AnimatedButton 
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const { success, connections: newConnections, error } = await generateConnections(selectedNodes);
                          
                          if (success) {
                            toast.success(`Generated ${newConnections.length} new connections!`);
                            // Reload data to get the new connections
                            await loadData();
                            // Clear selection
                            setSelectedNodes([]);
                          } else {
                            toast.error(error?.message || 'Failed to generate connections');
                          }
                        } catch (error) {
                          console.error('Error generating connections:', error);
                          toast.error('An unexpected error occurred');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      variant="primary"
                      icon={<i className="bi bi-diagram-3"></i>}
                    >
                      Find Connections
                    </AnimatedButton>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Interests Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredNodes.length === 0 ? (
              <motion.div 
                className="card bg-neutral-50 text-center py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.i 
                  className="bi bi-search text-4xl text-neutral-400 mb-3"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.2, 1] }}
                  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                />
                <motion.h3 
                  className="text-lg font-medium text-neutral-700 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  No Interests Found
                </motion.h3>
                <motion.p 
                  className="text-neutral-600 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {searchQuery || categoryFilter !== 'all' 
                    ? "Try adjusting your search or filters"
                    : "Start by adding your interests, hobbies, or topics you're curious about."}
                </motion.p>
                <AnimatedButton 
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('all')
                    if (nodes.length === 0) {
                      setIsAddModalOpen(true)
                    }
                  }}
                  variant="primary"
                  icon={nodes.length === 0 ? <i className="bi bi-plus-lg"></i> : <i className="bi bi-x-circle"></i>}
                >
                  {nodes.length === 0 ? "Add Your First Interest" : "Clear Filters"}
                </AnimatedButton>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="initial"
                animate="animate"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {filteredNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    variants={{
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                    }}
                  >
                    <InterestNode 
                      node={node} 
                      onEdit={handleEditClick} 
                      onDelete={handleDeleteClick} 
                      onSelect={handleNodeSelect}
                      isSelected={selectedNodes.includes(node.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="graph-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SimpleGraphView 
              nodes={nodes} 
              connections={connections} 
              onNodeClick={handleNodeSelect}
              onDeleteConnection={handleDeleteConnection}
              onCreateConnection={handleCreateConnection}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Node Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Knowledge Node"
      >
        <InterestNodeForm
          onSubmit={handleAddNode}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Node Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingNode(null)
        }}
        title="Edit Knowledge Node"
      >
        <InterestNodeForm
          node={editingNode}
          onSubmit={handleUpdateNode}
          onCancel={() => {
            setIsEditModalOpen(false)
            setEditingNode(null)
          }}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setNodeToDelete(null)
        }}
        title="Delete Knowledge Node"
      >
        <div>
          <p className="text-neutral-700 mb-6">
            Are you sure you want to delete this node? All connections to this node will also be deleted. This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setNodeToDelete(null)
              }}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteNode}
              className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CosmicKnowledgeNexus
