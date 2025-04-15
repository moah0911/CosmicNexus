import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchDiscoveryPrompts, deleteDiscoveryPrompt, toggleFavoritePrompt } from '../services/interestService';
import Modal from '../components/Modal';

const CosmicInsights = () => {
  // State management
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Modal state
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort insights when dependencies change
  useEffect(() => {
    filterAndSortInsights();
  }, [insights, searchTerm, filterFavorites, sortBy]);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);

      const result = await fetchDiscoveryPrompts();

      if (result.success) {
        setInsights(result.data);
      }
    } catch (error) {
      console.error('Error loading insights data:', error);
      toast.error('Failed to load your cosmic insights');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort insights
  const filterAndSortInsights = () => {
    let filtered = [...insights];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(insight =>
        insight.content?.toLowerCase().includes(lowerSearchTerm) ||
        insight.related_nodes?.some(node => node.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Apply favorites filter
    if (filterFavorites) {
      filtered = filtered.filter(insight => insight.is_favorite);
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
        filtered.sort((a, b) => a.content?.localeCompare(b.content));
        break;
      default:
        break;
    }

    setFilteredInsights(filtered);
  };

  // Handle insight deletion
  const handleDeleteInsight = async () => {
    if (!insightToDelete) return;

    try {
      const { success, error } = await deleteDiscoveryPrompt(insightToDelete.id);

      if (success) {
        // Update local state
        setInsights(prev => prev.filter(i => i.id !== insightToDelete.id));
        toast.success('Cosmic insight deleted successfully');
      } else {
        toast.error(error?.message || 'Failed to delete insight');
      }
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleteModalOpen(false);
      setInsightToDelete(null);
    }
  };

  // Handle toggling favorite status
  const handleToggleFavorite = async (insight) => {
    try {
      const newStatus = !insight.is_favorite;
      const { success } = await toggleFavoritePrompt(insight.id, newStatus);

      if (success) {
        // Update local state
        setInsights(prev => prev.map(i =>
          i.id === insight.id ? { ...i, is_favorite: newStatus } : i
        ));
        toast.success(newStatus ? 'Added to favorites' : 'Removed from favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  // Export insight to text file
  const handleExportInsight = (insight) => {
    // Create text to export
    const exportText = `
Cosmic Insight:
--------------
${insight.content}

Related Knowledge Nodes: ${insight.related_nodes ? insight.related_nodes.join(', ') : 'None'}
Date: ${new Date(insight.created_at).toLocaleDateString()}
    `.trim();

    // Create a blob and download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-insight-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Insight exported successfully');
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-800 to-cyan-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
            <i className="bi bi-lightbulb text-2xl relative z-10"></i>
            <div className="absolute inset-0 bg-blue-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(147, 197, 253, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-blue-200">Loading your cosmic insights...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-400"
          style={{
            textShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            letterSpacing: '0.05em'
          }}>
          Cosmic Insights
        </h1>
        <p className="text-blue-300 text-lg max-w-2xl"
          style={{
            textShadow: '0 0 10px rgba(59, 130, 246, 0.2)',
            lineHeight: '1.6'
          }}>
          Explore AI-generated insights that reveal hidden connections and new perspectives in your knowledge universe.
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="mb-8 bg-black/40 backdrop-blur-md rounded-xl border border-blue-900/50 p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search insights..."
                className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-blue-700/50 focus:border-blue-500 bg-black/60 text-blue-200 placeholder-blue-400/70"
              />
              <div className="absolute left-3 top-2.5 text-blue-400">
                <i className="bi bi-search"></i>
              </div>
            </div>
          </div>

          {/* Favorites Filter */}
          <div className="w-full md:w-48">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`w-full px-4 py-2 rounded-lg border-2 ${
                filterFavorites
                  ? 'bg-amber-900/30 border-amber-600/50 text-amber-300'
                  : 'bg-black/60 border-blue-700/50 text-blue-300 hover:border-amber-600/50 hover:text-amber-300'
              } transition-all duration-300 flex items-center justify-center`}
            >
              <i className={`bi ${filterFavorites ? 'bi-star-fill' : 'bi-star'} mr-2`}></i>
              <span>{filterFavorites ? 'Showing Favorites' : 'Show Favorites'}</span>
            </button>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-700/50 focus:border-blue-500 bg-black/60 text-blue-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-200 relative">
            <span className="relative z-10">
              {filteredInsights.length} {filteredInsights.length === 1 ? 'Insight' : 'Insights'}
            </span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          </h2>
          <Link
            to="/generate-insights"
            className="px-8 py-4 rounded-full bg-purple-600 text-white text-lg font-medium hover:bg-purple-500 transition-all duration-300 inline-block cursor-pointer"
            style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
          >
            Generate New Insights
          </Link>
        </div>

        {filteredInsights.length === 0 ? (
          <div className="p-8 rounded-xl bg-black/40 border border-blue-800/30 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-4">
              <i className="bi bi-lightbulb text-2xl"></i>
            </div>
            <h3 className="text-xl font-medium text-blue-200 mb-3">No Insights Found</h3>
            <p className="text-blue-300 mb-6 max-w-md mx-auto">
              {insights.length === 0
                ? "You haven't generated any cosmic insights yet. Start exploring new connections and perspectives in your knowledge universe."
                : "No insights match your current filters. Try adjusting your search criteria or clear filters to see all insights."}
            </p>
            {insights.length === 0 ? (
              <Link to="/generate-insights" className="px-8 py-4 rounded-full bg-purple-600 text-white text-lg font-medium hover:bg-purple-500 transition-all duration-300 inline-block cursor-pointer" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                Generate Your First Insight
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterFavorites(false);
                  setSortBy('newest');
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 inline-block"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredInsights.map(insight => (
              <motion.div
                key={insight.id}
                variants={itemVariants}
                className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-800/30 hover:shadow-lg transition-all duration-300 p-5"
                style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)' }}
              >
                {/* Favorite indicator */}
                {insight.is_favorite && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black/60 rounded-full shadow-md flex items-center justify-center z-10 border border-amber-600/50">
                    <i className="bi bi-star-fill text-amber-400"></i>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-800 to-cyan-800 flex items-center justify-center text-blue-300 mr-3 shadow-sm relative overflow-hidden"
                      style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                      <i className="bi bi-lightbulb text-lg relative z-10"></i>
                      <div className="absolute inset-0 bg-blue-500 opacity-0 animate-pulse"
                        style={{
                          animationDuration: '3s',
                          boxShadow: 'inset 0 0 20px rgba(147, 197, 253, 0.5)'
                        }}>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-300">Cosmic Insight</h3>
                      <div className="flex items-center mt-1">
                        <i className="bi bi-calendar-event text-blue-500 text-xs mr-1.5"></i>
                        <span className="text-xs text-blue-400">
                          {new Date(insight.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setInsightToDelete(insight);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-400 hover:text-red-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-red-700/30"
                      title="Delete insight"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInsight(insight);
                        setIsViewModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-blue-700/30"
                      title="View full insight"
                    >
                      <i className="bi bi-arrows-fullscreen"></i>
                    </button>
                  </div>
                </div>

                <div className="bg-black/60 p-5 rounded-xl shadow-sm border border-blue-800/30 mb-4">
                  <p className="text-blue-300 font-serif italic leading-relaxed line-clamp-4">
                    "{insight.content}"
                  </p>
                </div>

                {insight.related_nodes && insight.related_nodes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
                      <i className="bi bi-diagram-3 mr-2"></i>
                      <span>Related Knowledge Nodes:</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.related_nodes.map((node, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1.5 text-sm font-medium rounded-full bg-black/40 text-blue-300 shadow-sm border border-blue-700/30"
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-blue-800/30">
                  <button
                    onClick={() => handleToggleFavorite(insight)}
                    className={`flex items-center px-3 py-1.5 rounded-full shadow-sm transition-all duration-200 ${
                      insight.is_favorite
                        ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-800/50 border border-amber-700/50'
                        : 'bg-black/60 text-blue-400 hover:text-amber-300 hover:bg-amber-900/20 border border-blue-700/30'
                    }`}
                  >
                    <i className={`bi ${insight.is_favorite ? 'bi-star-fill' : 'bi-star'} mr-2`}></i>
                    <span className="text-sm font-medium">{insight.is_favorite ? 'Favorited' : 'Add to Favorites'}</span>
                  </button>

                  <button
                    onClick={() => handleExportInsight(insight)}
                    className="flex items-center px-3 py-1.5 rounded-full bg-black/60 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 shadow-sm transition-all duration-200 border border-blue-700/30"
                  >
                    <i className="bi bi-download mr-2"></i>
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* View Insight Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInsight(null);
        }}
        title="Cosmic Insight"
      >
        {selectedInsight && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center text-white mr-4 relative overflow-hidden"
                  style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
                  <i className="bi bi-lightbulb text-xl relative z-10"></i>
                  <div className="absolute inset-0 bg-blue-500 opacity-0 animate-pulse"
                    style={{
                      animationDuration: '3s',
                      boxShadow: 'inset 0 0 20px rgba(147, 197, 253, 0.5)'
                    }}>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-200">Cosmic Insight</h3>
                  <div className="flex items-center mt-1">
                    <i className="bi bi-calendar-event text-blue-500 text-sm mr-1.5"></i>
                    <span className="text-sm text-blue-400">
                      {new Date(selectedInsight.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleFavorite(selectedInsight)}
                className={`flex items-center px-3 py-1.5 rounded-full shadow-sm transition-all duration-200 ${
                  selectedInsight.is_favorite
                    ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-800/50 border border-amber-700/50'
                    : 'bg-black/60 text-blue-400 hover:text-amber-300 hover:bg-amber-900/20 border border-blue-700/30'
                }`}
              >
                <i className={`bi ${selectedInsight.is_favorite ? 'bi-star-fill' : 'bi-star'} mr-2`}></i>
                <span className="text-sm font-medium">{selectedInsight.is_favorite ? 'Favorited' : 'Add to Favorites'}</span>
              </button>
            </div>

            <div className="bg-black/60 p-6 rounded-xl shadow-sm border border-blue-800/30 mb-6">
              <p className="text-blue-300 font-serif italic leading-relaxed text-lg">
                "{selectedInsight.content}"
              </p>
            </div>

            {selectedInsight.related_nodes && selectedInsight.related_nodes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium text-blue-300 mb-3 flex items-center">
                  <i className="bi bi-diagram-3 mr-2"></i>
                  <span>Related Knowledge Nodes:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInsight.related_nodes.map((node, index) => (
                    <span
                      key={index}
                      className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-black/40 text-blue-300 shadow-sm border border-blue-700/30"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-blue-800/30">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedInsight(null);
                }}
                className="px-6 py-3 rounded-xl border border-blue-700/50 text-blue-300 hover:bg-blue-900/30 transition-all duration-300"
              >
                <i className="bi bi-x-circle mr-2"></i> Close
              </button>
              <button
                onClick={() => handleExportInsight(selectedInsight)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-cyan-600"
                style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
              >
                <i className="bi bi-download mr-2"></i> Export Insight
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInsightToDelete(null);
        }}
        title="Delete Cosmic Insight"
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
            Are you sure you want to delete this cosmic insight? This action cannot be undone.
          </p>

          {insightToDelete && (
            <div className="bg-black/60 p-4 rounded-xl shadow-sm border border-blue-800/30 mb-6 max-h-[150px] overflow-y-auto">
              <p className="text-blue-300 font-serif italic leading-relaxed text-sm">"{insightToDelete.content}"</p>
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setInsightToDelete(null);
              }}
              className="px-6 py-3 rounded-xl border border-blue-700/50 text-blue-300 hover:bg-blue-900/30 transition-all duration-300 min-w-[120px]"
            >
              <i className="bi bi-arrow-left mr-2"></i> Cancel
            </button>
            <button
              onClick={handleDeleteInsight}
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

export default CosmicInsights;
