import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchInterestNodes, fetchConnections, fetchDiscoveryPrompts } from '../services/interestService';
import { COSMIC_TYPES, getCategoryIcon } from '../models/CosmicTypes';

const CosmicHub = () => {
  // State management
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load all data from the API
  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [nodesResult, connectionsResult, insightsResult] = await Promise.all([
        fetchInterestNodes(),
        fetchConnections(),
        fetchDiscoveryPrompts()
      ]);

      if (nodesResult.success) {
        setNodes(nodesResult.data);
      }

      if (connectionsResult.success) {
        setConnections(connectionsResult.data);
      }

      if (insightsResult.success) {
        setInsights(insightsResult.data);
      }
    } catch (error) {
      console.error('Error loading cosmic hub data:', error);
      toast.error('Failed to load your cosmic data');
    } finally {
      setLoading(false);
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
            <i className="bi bi-stars text-2xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-purple-200">Loading your cosmic universe...</h2>
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
          Cosmic Hub
        </h1>
        <p className="text-purple-300 text-lg max-w-2xl"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}>
          Your central dashboard for exploring connections, insights, and discoveries in your knowledge universe.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-purple-800/30">
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
          {['overview', 'connections', 'insights', 'discoveries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-900/30 text-purple-200 border-t border-l border-r border-purple-700/50'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20'
              }`}
            >
              <i className={`bi ${
                tab === 'overview' ? 'bi-grid' :
                tab === 'connections' ? 'bi-link' :
                tab === 'insights' ? 'bi-lightbulb' : 'bi-stars'
              } mr-2`}></i>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-10">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Knowledge Nodes Card */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-900/50 shadow-xl overflow-hidden"
              style={{ boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-200">Knowledge Nodes</h2>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white">
                    <i className="bi bi-diagram-3 text-xl"></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-300 mb-2">{nodes.length}</div>
                <p className="text-purple-400 mb-4">Total knowledge nodes in your universe</p>
                <div className="mt-4 pt-4 border-t border-purple-800/30 flex justify-between items-center">
                  <Link to="/map" className="text-purple-300 hover:text-purple-100 font-medium flex items-center group">
                    <span>Explore Map</span>
                    <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </Link>
                  <Link to="/create-node" className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-sm flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300">
                    <i className="bi bi-plus-lg mr-1"></i>
                    <span>Add Node</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Connections Card */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-indigo-900/50 shadow-xl overflow-hidden"
              style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-indigo-200">Connections</h2>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white">
                    <i className="bi bi-link-45deg text-xl"></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-indigo-300 mb-2">{connections.length}</div>
                <p className="text-indigo-400 mb-4">Connections between your knowledge nodes</p>
                <div className="mt-4 pt-4 border-t border-indigo-800/30 flex justify-between items-center">
                  <Link to="/cosmic-connections" className="text-indigo-300 hover:text-indigo-100 font-medium flex items-center group">
                    <span>View All</span>
                    <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </Link>
                  <Link to="/create-connection" className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-700 to-blue-700 text-white text-sm flex items-center hover:from-indigo-600 hover:to-blue-600 transition-all duration-300">
                    <i className="bi bi-plus-lg mr-1"></i>
                    <span>Connect</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Insights Card */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden"
              style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-200">Insights</h2>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center text-white">
                    <i className="bi bi-lightbulb text-xl"></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-300 mb-2">{insights.length}</div>
                <p className="text-blue-400 mb-4">AI-generated insights and discoveries</p>
                <div className="mt-4 pt-4 border-t border-blue-800/30 flex justify-between items-center">
                  <Link to="/cosmic-insights" className="text-blue-300 hover:text-blue-100 font-medium flex items-center group">
                    <span>Explore Insights</span>
                    <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
                  </Link>
                  <Link to="/generate-insights" className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-700 to-cyan-700 text-white text-sm flex items-center hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                    <i className="bi bi-stars mr-1"></i>
                    <span>Generate</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-indigo-200 relative">
                <span className="relative z-10">Recent Connections</span>
                <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
              </h2>
              <Link to="/cosmic-connections" className="text-indigo-300 hover:text-indigo-100 font-medium flex items-center group">
                <span>View All</span>
                <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
              </Link>
            </div>

            {connections.length === 0 ? (
              <div className="p-8 rounded-xl bg-black/40 border border-indigo-800/30 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-4">
                  <i className="bi bi-link-45deg text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-indigo-200 mb-3">No Connections Yet</h3>
                <p className="text-indigo-300 mb-6 max-w-md mx-auto">
                  Start connecting your knowledge nodes to discover relationships between different areas of your cosmic universe.
                </p>
                <Link to="/create-connection" className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 inline-block">
                  Create Your First Connection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.slice(0, 4).map(connection => (
                  <motion.div
                    key={connection.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-black/40 backdrop-blur-md rounded-xl border border-indigo-800/30 p-5 hover:shadow-lg transition-all duration-300"
                    style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-3">
                          <i className="bi bi-link-45deg text-lg"></i>
                        </div>
                        <div>
                          <h3 className="font-bold text-indigo-200">Connection</h3>
                          <div className="text-xs text-indigo-400">
                            {new Date(connection.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-xs border border-indigo-700/30">
                        {connection.relationship_type || 'related'}
                      </div>
                    </div>
                    <p className="text-indigo-300 mb-3 line-clamp-2">{connection.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-indigo-800/30">
                      <div className="text-indigo-400 text-sm">
                        <span className="font-medium">{connection.source_name || 'Node'}</span>
                        <i className="bi bi-arrow-right mx-2"></i>
                        <span className="font-medium">{connection.target_name || 'Node'}</span>
                      </div>
                      <div className="flex items-center">
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
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-200 relative">
                <span className="relative z-10">Recent Insights</span>
                <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </h2>
              <Link to="/cosmic-insights" className="text-blue-300 hover:text-blue-100 font-medium flex items-center group">
                <span>View All</span>
                <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
              </Link>
            </div>

            {insights.length === 0 ? (
              <div className="p-8 rounded-xl bg-black/40 border border-blue-800/30 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-4">
                  <i className="bi bi-lightbulb text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-blue-200 mb-3">No Insights Yet</h3>
                <p className="text-blue-300 mb-6 max-w-md mx-auto">
                  Generate AI-powered insights to explore new dimensions and undiscovered territories in your cosmic knowledge universe.
                </p>
                <Link to="/generate-insights" className="px-8 py-4 rounded-full bg-purple-600 text-white text-lg font-medium hover:bg-purple-500 transition-all duration-300 inline-block cursor-pointer" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                  Generate New Insights
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.slice(0, 4).map(insight => (
                  <motion.div
                    key={insight.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-800/30 p-5 hover:shadow-lg transition-all duration-300"
                    style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)' }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-cyan-700 flex items-center justify-center text-white mr-3">
                        <i className="bi bi-lightbulb text-lg"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-200">Cosmic Insight</h3>
                        <div className="text-xs text-blue-400">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {insight.is_favorite && (
                        <div className="ml-auto">
                          <i className="bi bi-star-fill text-amber-400"></i>
                        </div>
                      )}
                    </div>
                    <p className="text-blue-300 mb-3 line-clamp-3 font-serif italic">"{insight.content}"</p>
                    {insight.related_nodes && insight.related_nodes.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-800/30">
                        {insight.related_nodes.map((node, i) => (
                          <div key={i} className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-300 text-xs border border-blue-700/30">
                            {node}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discoveries' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-200 relative">
                <span className="relative z-10">Knowledge Categories</span>
                <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              </h2>
              <Link to="/map" className="text-purple-300 hover:text-purple-100 font-medium flex items-center group">
                <span>Explore Map</span>
                <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
              </Link>
            </div>

            {nodes.length === 0 ? (
              <div className="p-8 rounded-xl bg-black/40 border border-purple-800/30 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4">
                  <i className="bi bi-diagram-3 text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-purple-200 mb-3">No Knowledge Nodes Yet</h3>
                <p className="text-purple-300 mb-6 max-w-md mx-auto">
                  Start adding knowledge nodes to build your cosmic universe of interconnected ideas and concepts.
                </p>
                <Link to="/create-node" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block">
                  Create Your First Node
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  nodes.reduce((acc, node) => {
                    const category = node.category || 'other';
                    if (!acc[category]) acc[category] = 0;
                    acc[category]++;
                    return acc;
                  }, {})
                ).map(([category, count]) => (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-black/40 backdrop-blur-md rounded-xl border border-purple-800/30 p-4 hover:shadow-lg transition-all duration-300 text-center"
                    style={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.1)' }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white mx-auto mb-3">
                      <i className={`bi ${getCategoryIcon(category)} text-lg`}></i>
                    </div>
                    <h3 className="font-bold text-purple-200 capitalize">{category}</h3>
                    <div className="text-2xl font-bold text-purple-300 mt-1">{count}</div>
                    <div className="text-xs text-purple-400 mt-1">nodes</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)' }}>
            <i className="bi bi-plus text-2xl"></i>
          </button>

          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <div className="flex flex-col space-y-2 items-end">
              <Link to="/create-node" className="flex items-center bg-black/80 backdrop-blur-md rounded-full px-4 py-2 text-purple-300 hover:text-white hover:bg-purple-900/80 transition-all duration-300 shadow-md">
                <span className="mr-2">Add Node</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-center">
                  <i className="bi bi-diagram-3"></i>
                </div>
              </Link>

              <Link to="/create-connection" className="flex items-center bg-black/80 backdrop-blur-md rounded-full px-4 py-2 text-indigo-300 hover:text-white hover:bg-indigo-900/80 transition-all duration-300 shadow-md">
                <span className="mr-2">Create Connection</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-700 to-blue-700 flex items-center justify-center">
                  <i className="bi bi-link-45deg"></i>
                </div>
              </Link>

              <Link to="/generate-insights" className="flex items-center bg-black/80 backdrop-blur-md rounded-full px-4 py-2 text-purple-300 hover:text-white hover:bg-purple-900/80 transition-all duration-300 shadow-md">
                <span className="mr-2">Generate Insights</span>
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <i className="bi bi-lightbulb"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicHub;
