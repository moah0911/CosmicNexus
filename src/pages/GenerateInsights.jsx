import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchInterestNodes, generateConnections } from '../services/interestService';
import { getCategoryIcon } from '../models/CosmicTypes';

const GenerateInsights = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get preselected node IDs from location state if available
  const preselectedNodeIds = location.state?.preselectedNodeIds || [];

  // State management
  const [nodes, setNodes] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNodes, setFilteredNodes] = useState([]);

  // Load nodes on component mount
  useEffect(() => {
    loadNodes();
  }, []);

  // Filter nodes when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNodes(nodes);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = nodes.filter(node =>
        node.title.toLowerCase().includes(lowerSearchTerm) ||
        node.description.toLowerCase().includes(lowerSearchTerm) ||
        node.category?.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredNodes(filtered);
    }
  }, [searchTerm, nodes]);

  // Set preselected nodes when nodes are loaded
  useEffect(() => {
    if (preselectedNodeIds.length > 0 && nodes.length > 0) {
      const nodesToSelect = nodes.filter(node => preselectedNodeIds.includes(node.id));
      setSelectedNodes(nodesToSelect);
    }
  }, [preselectedNodeIds, nodes]);

  // Load nodes from API
  const loadNodes = async () => {
    try {
      setLoading(true);
      const result = await fetchInterestNodes();

      if (result.success) {
        setNodes(result.data);
        setFilteredNodes(result.data);
      } else {
        toast.error('Failed to load knowledge nodes');
      }
    } catch (error) {
      console.error('Error loading nodes:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Toggle node selection
  const toggleNodeSelection = (node) => {
    if (selectedNodes.some(n => n.id === node.id)) {
      setSelectedNodes(selectedNodes.filter(n => n.id !== node.id));
    } else {
      setSelectedNodes([...selectedNodes, node]);
    }
  };

  // Handle generate insights
  const handleGenerateInsights = async () => {
    if (selectedNodes.length < 2) {
      toast.error('Please select at least 2 nodes to generate insights');
      return;
    }

    try {
      setGenerating(true);

      // Show a loading toast
      const loadingToastId = toast.loading('Generating cosmic insights...');

      // Call the API to generate connections and insights
      const result = await generateConnections(selectedNodes);
      const { success, error } = result;

      // Dismiss the loading toast
      toast.dismiss(loadingToastId);

      if (success) {
        toast.success('Cosmic insights generated successfully');
        navigate('/cosmic-insights');
      } else {
        toast.error(error?.message || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setGenerating(false);
    }
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
          <h2 className="text-xl font-medium text-blue-200">Loading nodes...</h2>
        </div>
      </div>
    );
  }

  // Not enough nodes
  if (nodes.length < 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-8 rounded-xl bg-black/40 border border-blue-800/30 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-4">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className="text-xl font-medium text-blue-200 mb-3">Not Enough Nodes</h3>
          <p className="text-blue-300 mb-6 max-w-md mx-auto">
            You need at least two knowledge nodes to generate insights. Please create more nodes first.
          </p>
          <Link to="/create-node" className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 inline-block">
            Create a Node
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/cosmic-insights"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-300"
        >
          <i className="bi bi-arrow-left mr-2"></i>
          <span>Back to Insights</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            letterSpacing: '0.05em'
          }}
        >
          Generate Cosmic Insights
        </motion.h1>
        <motion.p
          className="text-blue-300 text-lg max-w-3xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            textShadow: '0 0 10px rgba(59, 130, 246, 0.2)',
            lineHeight: '1.6'
          }}
        >
          Select knowledge nodes to discover hidden connections and generate AI-powered insights that reveal new perspectives in your cosmic universe.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Node Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden"
          style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-200">Select Knowledge Nodes</h2>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search nodes..."
                  className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-blue-700/50 focus:border-blue-500 bg-black/60 text-blue-200 placeholder-blue-400/70"
                />
                <div className="absolute left-3 top-2.5 text-blue-400">
                  <i className="bi bi-search"></i>
                </div>
              </div>
            </div>

            {filteredNodes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-4">
                  <i className="bi bi-search text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-blue-200 mb-3">No Nodes Found</h3>
                <p className="text-blue-300 mb-6 max-w-md mx-auto">
                  No nodes match your search criteria. Try a different search term or clear the search.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 inline-block"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredNodes.map(node => (
                  <div
                    key={node.id}
                    onClick={() => toggleNodeSelection(node)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedNodes.some(n => n.id === node.id)
                        ? 'bg-blue-900/40 border-2 border-blue-600/70'
                        : 'bg-black/60 border border-blue-800/30 hover:border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mr-3 ${
                        selectedNodes.some(n => n.id === node.id)
                          ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                          : 'bg-gradient-to-br from-blue-800 to-cyan-800'
                      }`}>
                        <i className={`bi ${getCategoryIcon(node.category)} text-sm`}></i>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-blue-200">{node.title}</h3>
                        <span className="text-xs text-blue-400">{node.category}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        selectedNodes.some(n => n.id === node.id)
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-blue-700 text-transparent'
                      }`}>
                        <i className="bi bi-check text-sm"></i>
                      </div>
                    </div>
                    <p className="text-blue-300 text-sm line-clamp-2">{node.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Selected Nodes & Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Selected Nodes */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-900/50 shadow-xl overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-200">Selected Nodes</h2>
                <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 text-sm border border-blue-700/30">
                  {selectedNodes.length} selected
                </span>
              </div>

              {selectedNodes.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-3">
                    <i className="bi bi-hand-index-thumb text-xl"></i>
                  </div>
                  <p className="text-blue-300 mb-2">No nodes selected</p>
                  <p className="text-blue-400 text-sm">Select at least 2 nodes to generate insights</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedNodes.map(node => (
                    <div
                      key={`selected-${node.id}`}
                      className="bg-black/60 p-3 rounded-lg border border-blue-800/30 hover:border-blue-700/50 transition-all duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center text-white mr-2">
                          <i className={`bi ${getCategoryIcon(node.category)} text-sm`}></i>
                        </div>
                        <span className="text-blue-300 font-medium">{node.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNodeSelection(node);
                        }}
                        className="text-blue-400 hover:text-blue-300 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-blue-700/30"
                        title="Remove node"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-900/50 shadow-xl overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}>
            <div className="p-5">
              <h2 className="text-xl font-bold text-blue-200 mb-4">Generate Insights</h2>
              <p className="text-blue-300 mb-6">
                Our AI will analyze the selected nodes and generate cosmic insights that reveal hidden connections and new perspectives.
              </p>
              <button
                onClick={handleGenerateInsights}
                disabled={generating || selectedNodes.length < 2}
                className="w-full px-8 py-4 rounded-full bg-purple-600 text-white text-lg font-medium hover:bg-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-purple-800 cursor-pointer text-center"
                style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
              >
                {generating ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                    Generating Insights...
                  </>
                ) : (
                  'Generate New Insights'
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-900/50 shadow-xl overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}>
            <div className="p-5">
              <h2 className="text-lg font-bold text-blue-200 mb-3">Tips for Better Insights</h2>
              <ul className="space-y-2 text-blue-300 text-sm">
                <li className="flex items-start">
                  <i className="bi bi-check-circle text-blue-400 mr-2 mt-1"></i>
                  <span>Select 3-5 nodes for the most interesting insights</span>
                </li>
                <li className="flex items-start">
                  <i className="bi bi-check-circle text-blue-400 mr-2 mt-1"></i>
                  <span>Choose nodes from different categories for diverse perspectives</span>
                </li>
                <li className="flex items-start">
                  <i className="bi bi-check-circle text-blue-400 mr-2 mt-1"></i>
                  <span>Include both related and seemingly unrelated nodes to discover unexpected connections</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GenerateInsights;
