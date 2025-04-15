import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchInterestNodes, fetchConnections, deleteConnection } from '../services/interestService';
import { RELATIONSHIP_TYPES, RELATIONSHIP_DISPLAY, getCategoryIcon } from '../models/CosmicTypes';
import Modal from '../components/Modal';

const CosmicConnections = () => {
  // State management
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [expandedConnectionId, setExpandedConnectionId] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort connections when dependencies change
  useEffect(() => {
    filterAndSortConnections();
  }, [connections, searchTerm, filterCategory, filterRelationship, sortBy]);

  // Get all unique categories from nodes
  const categories = useMemo(() => {
    const categorySet = new Set(nodes.map(node => node.category).filter(Boolean));
    return ['all', ...Array.from(categorySet)];
  }, [nodes]);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel for better performance
      const [nodesResult, connectionsResult] = await Promise.all([
        fetchInterestNodes(),
        fetchConnections()
      ]);

      if (nodesResult.success) {
        setNodes(nodesResult.data);
      }

      if (connectionsResult.success) {
        setConnections(connectionsResult.data);
      }
    } catch (error) {
      console.error('Error loading connections data:', error);
      toast.error('Failed to load your connections');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort connections
  const filterAndSortConnections = () => {
    let filtered = [...connections];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(conn => {
        // Get source and target node names
        const sourceNode = nodes.find(n => n.id === conn.source_node_id);
        const targetNode = nodes.find(n => n.id === conn.target_node_id);
        
        return (
          (sourceNode?.title?.toLowerCase().includes(lowerSearchTerm) || 
           targetNode?.title?.toLowerCase().includes(lowerSearchTerm) ||
           conn.description?.toLowerCase().includes(lowerSearchTerm))
        );
      });
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(conn => {
        const sourceNode = nodes.find(n => n.id === conn.source_node_id);
        const targetNode = nodes.find(n => n.id === conn.target_node_id);
        return sourceNode?.category === filterCategory || targetNode?.category === filterCategory;
      });
    }

    // Apply relationship filter
    if (filterRelationship !== 'all') {
      filtered = filtered.filter(conn => conn.relationship_type === filterRelationship);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'strength-high':
        filtered.sort((a, b) => (b.strength || 0) - (a.strength || 0));
        break;
      case 'strength-low':
        filtered.sort((a, b) => (a.strength || 0) - (b.strength || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => {
          const sourceNodeA = nodes.find(n => n.id === a.source_node_id)?.title || '';
          const sourceNodeB = nodes.find(n => n.id === b.source_node_id)?.title || '';
          return sourceNodeA.localeCompare(sourceNodeB);
        });
        break;
      default:
        break;
    }

    setFilteredConnections(filtered);
  };

  // Handle connection deletion
  const handleDeleteConnection = async () => {
    if (!connectionToDelete) return;

    try {
      const { success, error } = await deleteConnection(connectionToDelete.id);

      if (success) {
        // Update local state
        setConnections(prev => prev.filter(c => c.id !== connectionToDelete.id));
        toast.success('Connection deleted successfully');
      } else {
        toast.error(error?.message || 'Failed to delete connection');
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleteModalOpen(false);
      setConnectionToDelete(null);
    }
  };

  // Get node title by ID
  const getNodeTitle = (nodeId) => {
    return nodes.find(n => n.id === nodeId)?.title || 'Unknown Node';
  };

  // Get node category by ID
  const getNodeCategory = (nodeId) => {
    return nodes.find(n => n.id === nodeId)?.category || 'other';
  };

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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-800 to-blue-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
            <i className="bi bi-link-45deg text-2xl relative z-10"></i>
            <div className="absolute inset-0 bg-indigo-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(165, 180, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-indigo-200">Loading your connections...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-blue-400 to-indigo-400"
          style={{
            textShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            letterSpacing: '0.05em'
          }}>
          Cosmic Connections
        </h1>
        <p className="text-indigo-300 text-lg max-w-2xl"
          style={{
            textShadow: '0 0 10px rgba(99, 102, 241, 0.2)',
            lineHeight: '1.6'
          }}>
          Explore the relationships between your knowledge nodes and discover how different ideas connect in your cosmic universe.
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="mb-8 bg-black/40 backdrop-blur-md rounded-xl border border-indigo-900/50 p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search connections..."
                className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-indigo-700/50 focus:border-indigo-500 bg-black/60 text-indigo-200 placeholder-indigo-400/70"
              />
              <div className="absolute left-3 top-2.5 text-indigo-400">
                <i className="bi bi-search"></i>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-indigo-700/50 focus:border-indigo-500 bg-black/60 text-indigo-200"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Relationship Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterRelationship}
              onChange={(e) => setFilterRelationship(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-indigo-700/50 focus:border-indigo-500 bg-black/60 text-indigo-200"
            >
              <option value="all">All Relationships</option>
              {Object.entries(RELATIONSHIP_DISPLAY).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-indigo-700/50 focus:border-indigo-500 bg-black/60 text-indigo-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="strength-high">Strongest First</option>
              <option value="strength-low">Weakest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-black/60 text-indigo-400 hover:text-indigo-200 border-2 border-indigo-700/50'
              }`}
            >
              <i className="bi bi-grid"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-black/60 text-indigo-400 hover:text-indigo-200 border-2 border-indigo-700/50'
              }`}
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-200 relative">
            <span className="relative z-10">
              {filteredConnections.length} {filteredConnections.length === 1 ? 'Connection' : 'Connections'}
            </span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
          </h2>
          <Link
            to="/create-connection"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-700 to-blue-700 text-white flex items-center hover:from-indigo-600 hover:to-blue-600 transition-all duration-300"
            style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
          >
            <i className="bi bi-plus-lg mr-2"></i>
            <span>Create Connection</span>
          </Link>
        </div>

        {filteredConnections.length === 0 ? (
          <div className="p-8 rounded-xl bg-black/40 border border-indigo-800/30 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-4">
              <i className="bi bi-link-45deg text-2xl"></i>
            </div>
            <h3 className="text-xl font-medium text-indigo-200 mb-3">No Connections Found</h3>
            <p className="text-indigo-300 mb-6 max-w-md mx-auto">
              {connections.length === 0
                ? "You haven't created any connections yet. Start connecting your knowledge nodes to discover relationships between different areas of your cosmic universe."
                : "No connections match your current filters. Try adjusting your search criteria or clear filters to see all connections."}
            </p>
            {connections.length === 0 ? (
              <Link to="/create-connection" className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 inline-block">
                Create Your First Connection
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterRelationship('all');
                  setSortBy('newest');
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 inline-block"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}
          >
            {filteredConnections.map(connection => (
              <motion.div
                key={connection.id}
                variants={itemVariants}
                className={`bg-black/40 backdrop-blur-md rounded-xl border border-indigo-800/30 hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'grid' ? 'p-5' : 'p-4'
                }`}
                style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)' }}
              >
                <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center justify-between'}`}>
                  <div className={`flex items-center ${viewMode === 'grid' ? 'justify-between mb-3' : 'flex-grow'}`}>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-3">
                        <i className={`bi ${RELATIONSHIP_DISPLAY[connection.relationship_type || 'related'].icon}`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-indigo-200">
                          {RELATIONSHIP_DISPLAY[connection.relationship_type || 'related'].name} Connection
                        </h3>
                        <div className="text-xs text-indigo-400">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setConnectionToDelete(connection);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-400 hover:text-red-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-red-700/30"
                          title="Delete connection"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                        <button
                          onClick={() => setExpandedConnectionId(expandedConnectionId === connection.id ? null : connection.id)}
                          className="text-indigo-400 hover:text-indigo-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-indigo-700/30"
                          title={expandedConnectionId === connection.id ? "Collapse" : "Expand"}
                        >
                          <i className={`bi ${expandedConnectionId === connection.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>
                      </div>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        {Array.from({ length: connection.strength || 3 }).map((_, i) => (
                          <i key={i} className="bi bi-star-fill text-indigo-500 text-xs"></i>
                        ))}
                        {Array.from({ length: 5 - (connection.strength || 3) }).map((_, i) => (
                          <i key={i} className="bi bi-star text-indigo-700 text-xs"></i>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => {
                          setConnectionToDelete(connection);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-400 hover:text-red-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-red-700/30"
                        title="Delete connection"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>

                {viewMode === 'grid' && (
                  <div className={`transition-all duration-500 overflow-hidden ${
                    expandedConnectionId === connection.id ? 'max-h-[500px]' : 'max-h-32'
                  }`}>
                    <p className="text-indigo-300 mb-3">{connection.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-indigo-800/30">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-black/60 border border-indigo-700/50 flex items-center justify-center mr-2">
                            <i className={`bi ${getCategoryIcon(getNodeCategory(connection.source_node_id))} text-xs text-indigo-400`}></i>
                          </div>
                          <span className="text-indigo-300 font-medium">{getNodeTitle(connection.source_node_id)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-black/60 border border-indigo-700/50 flex items-center justify-center mr-2">
                            <i className={`bi ${getCategoryIcon(getNodeCategory(connection.target_node_id))} text-xs text-indigo-400`}></i>
                          </div>
                          <span className="text-indigo-300 font-medium">{getNodeTitle(connection.target_node_id)}</span>
                        </div>
                      </div>
                      
                      <div className="flex">
                        {Array.from({ length: connection.strength || 3 }).map((_, i) => (
                          <i key={i} className="bi bi-star-fill text-indigo-500 text-xs"></i>
                        ))}
                        {Array.from({ length: 5 - (connection.strength || 3) }).map((_, i) => (
                          <i key={i} className="bi bi-star text-indigo-700 text-xs"></i>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-black/60 border border-indigo-700/50 flex items-center justify-center mr-2">
                        <i className={`bi ${getCategoryIcon(getNodeCategory(connection.source_node_id))} text-xs text-indigo-400`}></i>
                      </div>
                      <span className="text-indigo-300 font-medium">{getNodeTitle(connection.source_node_id)}</span>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-xs border border-indigo-700/30 flex items-center">
                        <i className={`bi ${RELATIONSHIP_DISPLAY[connection.relationship_type || 'related'].icon} mr-1`}></i>
                        <span>{RELATIONSHIP_DISPLAY[connection.relationship_type || 'related'].name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end md:justify-start">
                      <div className="w-6 h-6 rounded-full bg-black/60 border border-indigo-700/50 flex items-center justify-center mr-2">
                        <i className={`bi ${getCategoryIcon(getNodeCategory(connection.target_node_id))} text-xs text-indigo-400`}></i>
                      </div>
                      <span className="text-indigo-300 font-medium">{getNodeTitle(connection.target_node_id)}</span>
                    </div>
                    
                    <div className="md:col-span-3">
                      <p className="text-indigo-300 text-sm line-clamp-2">{connection.description}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setConnectionToDelete(null);
        }}
        title="Delete Connection"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.3)' }}>
              <i className="bi bi-exclamation-triangle text-red-300 text-2xl relative z-10"></i>
              <div className="absolute inset-0 bg-red-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(248, 113, 113, 0.5)'
                }}>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-red-300 text-center mb-4">Confirm Deletion</h3>

          <p className="text-red-400 text-center mb-6">
            Are you sure you want to delete this connection? This action cannot be undone.
          </p>

          {connectionToDelete && (
            <div className="bg-black/60 p-4 rounded-xl shadow-sm border border-indigo-800/30 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-2">
                    <i className={`bi ${RELATIONSHIP_DISPLAY[connectionToDelete.relationship_type || 'related'].icon} text-sm`}></i>
                  </div>
                  <span className="text-indigo-300 font-medium">
                    {RELATIONSHIP_DISPLAY[connectionToDelete.relationship_type || 'related'].name} Connection
                  </span>
                </div>
              </div>
              
              <p className="text-indigo-300 text-sm mb-3">{connectionToDelete.description}</p>
              
              <div className="flex items-center justify-between text-sm text-indigo-400">
                <span>{getNodeTitle(connectionToDelete.source_node_id)}</span>
                <i className="bi bi-arrow-right mx-2"></i>
                <span>{getNodeTitle(connectionToDelete.target_node_id)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setConnectionToDelete(null);
              }}
              className="px-6 py-3 rounded-xl border border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 transition-all duration-300 min-w-[120px]"
            >
              <i className="bi bi-arrow-left mr-2"></i> Cancel
            </button>
            <button
              onClick={handleDeleteConnection}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 min-w-[120px]"
              style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.3)' }}
            >
              <i className="bi bi-trash mr-2"></i> Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CosmicConnections;
