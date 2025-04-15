import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchInterestNodes } from '../services/interestService';
import { CATEGORY_DISPLAY, getCategoryIcon } from '../models/CosmicTypes';

const CosmicDiscoveries = () => {
  // State management
  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort nodes when dependencies change
  useEffect(() => {
    filterAndSortNodes();
  }, [nodes, searchTerm, filterCategory, sortBy]);

  // Get all unique categories from nodes
  const categories = useMemo(() => {
    const categorySet = new Set(nodes.map(node => node.category).filter(Boolean));
    return ['all', ...Array.from(categorySet)];
  }, [nodes]);

  // Get category statistics
  const categoryStats = useMemo(() => {
    return nodes.reduce((acc, node) => {
      const category = node.category || 'other';
      if (!acc[category]) acc[category] = 0;
      acc[category]++;
      return acc;
    }, {});
  }, [nodes]);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      const result = await fetchInterestNodes();

      if (result.success) {
        setNodes(result.data);
      }
    } catch (error) {
      console.error('Error loading nodes data:', error);
      toast.error('Failed to load your knowledge nodes');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort nodes
  const filterAndSortNodes = () => {
    let filtered = [...nodes];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.title?.toLowerCase().includes(lowerSearchTerm) ||
        node.description?.toLowerCase().includes(lowerSearchTerm) ||
        node.category?.toLowerCase().includes(lowerSearchTerm) ||
        node.notes?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(node => node.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title?.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredNodes(filtered);
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
            <i className="bi bi-diagram-3 text-2xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-purple-200">Loading your knowledge nodes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}>
          Cosmic Discoveries
        </h1>
        <p className="text-purple-300 text-lg max-w-2xl"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}>
          Explore your knowledge universe and discover the cosmic nodes that form the foundation of your personal knowledge graph.
        </p>
      </div>

      {/* Category Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-purple-200 relative mb-6">
          <span className="relative z-10">Knowledge Categories</span>
          <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(categoryStats).map(([category, count]) => (
            <motion.div
              key={category}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              className={`bg-black/40 backdrop-blur-md rounded-xl border border-purple-800/30 p-4 hover:shadow-lg transition-all duration-300 text-center cursor-pointer ${
                filterCategory === category ? 'border-purple-500 shadow-md' : ''
              }`}
              style={{ 
                boxShadow: filterCategory === category ? '0 4px 20px rgba(147, 51, 234, 0.2)' : '0 4px 20px rgba(147, 51, 234, 0.1)'
              }}
              onClick={() => setFilterCategory(category === filterCategory ? 'all' : category)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white mx-auto mb-3">
                <i className={`bi ${getCategoryIcon(category)} text-lg`}></i>
              </div>
              <h3 className="font-bold text-purple-200 capitalize">{CATEGORY_DISPLAY[category]?.name || category}</h3>
              <div className="text-2xl font-bold text-purple-300 mt-1">{count}</div>
              <div className="text-xs text-purple-400 mt-1">nodes</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="mb-8 bg-black/40 backdrop-blur-md rounded-xl border border-purple-900/50 p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search knowledge nodes..."
                className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-purple-700/50 focus:border-purple-500 bg-black/60 text-purple-200 placeholder-purple-400/70"
              />
              <div className="absolute left-3 top-2.5 text-purple-400">
                <i className="bi bi-search"></i>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-purple-700/50 focus:border-purple-500 bg-black/60 text-purple-200"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>
                  {CATEGORY_DISPLAY[category]?.name || category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-purple-700/50 focus:border-purple-500 bg-black/60 text-purple-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-purple-700 text-white'
                  : 'bg-black/60 text-purple-400 hover:text-purple-200 border-2 border-purple-700/50'
              }`}
            >
              <i className="bi bi-grid"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-purple-700 text-white'
                  : 'bg-black/60 text-purple-400 hover:text-purple-200 border-2 border-purple-700/50'
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
          <h2 className="text-2xl font-bold text-purple-200 relative">
            <span className="relative z-10">
              {filteredNodes.length} Knowledge {filteredNodes.length === 1 ? 'Node' : 'Nodes'}
            </span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <Link
            to="/create-node"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
          >
            <i className="bi bi-plus-lg mr-2"></i>
            <span>Add Knowledge Node</span>
          </Link>
        </div>

        {filteredNodes.length === 0 ? (
          <div className="p-8 rounded-xl bg-black/40 border border-purple-800/30 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4">
              <i className="bi bi-diagram-3 text-2xl"></i>
            </div>
            <h3 className="text-xl font-medium text-purple-200 mb-3">No Knowledge Nodes Found</h3>
            <p className="text-purple-300 mb-6 max-w-md mx-auto">
              {nodes.length === 0
                ? "You haven't created any knowledge nodes yet. Start building your cosmic universe by adding your first node."
                : "No nodes match your current filters. Try adjusting your search criteria or clear filters to see all nodes."}
            </p>
            {nodes.length === 0 ? (
              <Link to="/create-node" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block">
                Create Your First Node
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setSortBy('newest');
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block"
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
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {filteredNodes.map(node => (
              <motion.div
                key={node.id}
                variants={itemVariants}
                className={`bg-black/40 backdrop-blur-md rounded-xl border border-purple-800/30 hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'grid' ? 'p-5' : 'p-4'
                }`}
                style={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.1)' }}
              >
                <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center justify-between'}`}>
                  <div className={`flex items-center ${viewMode === 'grid' ? 'justify-between mb-3' : 'flex-grow'}`}>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white mr-3">
                        <i className={`bi ${getCategoryIcon(node.category)} text-lg`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-purple-200">{node.title}</h3>
                        <div className="text-xs text-purple-400">
                          {new Date(node.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && (
                      <div className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-xs border border-purple-700/30 capitalize">
                        {CATEGORY_DISPLAY[node.category]?.name || node.category || 'Other'}
                      </div>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-xs border border-purple-700/30 capitalize">
                        {CATEGORY_DISPLAY[node.category]?.name || node.category || 'Other'}
                      </div>
                      
                      <Link
                        to={`/node/${node.id}`}
                        className="text-purple-400 hover:text-purple-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-purple-700/30"
                        title="View node details"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                    </div>
                  )}
                </div>

                {viewMode === 'grid' && (
                  <>
                    <div className="bg-black/60 p-4 rounded-xl shadow-sm border border-purple-800/30 mb-4 min-h-[100px]">
                      <p className="text-purple-300 line-clamp-4">{node.description}</p>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-purple-800/30">
                      <Link
                        to={`/node/${node.id}`}
                        className="flex items-center px-3 py-1.5 rounded-full bg-black/60 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 shadow-sm transition-all duration-200 border border-purple-700/30"
                      >
                        <i className="bi bi-eye mr-2"></i>
                        <span className="text-sm font-medium">View Details</span>
                      </Link>
                    </div>
                  </>
                )}

                {viewMode === 'list' && (
                  <div className="mt-3">
                    <p className="text-purple-300 text-sm line-clamp-2">{node.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CosmicDiscoveries;
