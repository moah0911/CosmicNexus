import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchInterestNodes, fetchConnections, fetchDiscoveryPrompts } from '../services/interestService'
import InterestNode from '../components/InterestNode'
import ConnectionCard from '../components/ConnectionCard'
import DiscoveryPrompt from '../components/DiscoveryPrompt'

const Dashboard = () => {
  const navigate = useNavigate()
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [discoveryPrompts, setDiscoveryPrompts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
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
        console.error('Error loading dashboard data:', error)
        toast.error('Failed to load your data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Find nodes for a connection
  const getNodesForConnection = (connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source_node_id)
    const targetNode = nodes.find(node => node.id === connection.target_node_id)
    return { sourceNode, targetNode }
  }

  // Node creation is now handled in the CreateNode page

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black bg-opacity-70">
        <div className="relative">
          {/* Sparkle effects */}
          <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '-20px', left: '20px', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30px', left: '80px', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70px', left: '-15px', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
              <i className="bi bi-stars text-3xl relative z-10"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                }}>
              </div>
            </div>
            <h2 className="text-xl font-medium text-purple-200">Aligning your cosmic data...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
              style={{
                textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
                letterSpacing: '0.05em'
              }}>
              Cosmic Command Center
            </h1>
            <p className="text-purple-300 text-lg max-w-2xl"
              style={{
                textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
                lineHeight: '1.6'
              }}>
              <span className="text-indigo-300 font-medium">Navigate</span> your universe of ideas, <span className="text-indigo-300 font-medium">discover</span> hidden connections, and <span className="text-indigo-300 font-medium">explore</span> new cosmic frontiers.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              to="/cosmic-hub"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 group cursor-pointer"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
            >
              <i className="bi bi-stars mr-2"></i>
              <span>Enter Cosmic Hub</span>
              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white">New</span>
              <i className="bi bi-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/cosmic-discoveries" className="block p-6 rounded-xl bg-black/40 border border-purple-800/30 hover:border-purple-700/50 hover:bg-black/50 transition-all duration-300 relative overflow-hidden cursor-pointer transform hover:translate-y-[-2px]"
          style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 25px rgba(147, 51, 234, 0.25)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.1)'}>

          {/* Subtle animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>

          <div className="flex items-center justify-between relative">
            <div>
              <h3 className="text-lg font-medium text-purple-200 mb-1">Knowledge Nodes</h3>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-400">{nodes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.2)' }}>
              <i className="bi bi-diagram-3 text-xl text-purple-300 relative z-10"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                }}>
              </div>
            </div>
          </div>

        </Link>

        <Link to="/cosmic-connections" className="block p-6 rounded-xl bg-black/40 border border-indigo-800/30 hover:border-indigo-700/50 hover:bg-black/50 transition-all duration-300 relative overflow-hidden cursor-pointer transform hover:translate-y-[-2px]"
          style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 25px rgba(99, 102, 241, 0.25)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.1)'}>

          {/* Subtle animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-900/10 to-blue-900/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>

          <div className="flex items-center justify-between relative">
            <div>
              <h3 className="text-lg font-medium text-indigo-200 mb-1">Celestial Links</h3>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-400">{connections.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-900/30 flex items-center justify-center relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}>
              <i className="bi bi-link-45deg text-xl text-indigo-300 relative z-10"></i>
              <div className="absolute inset-0 bg-indigo-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(165, 180, 252, 0.5)'
                }}>
              </div>
            </div>
          </div>

        </Link>

        <Link to="/cosmic-insights" className="block p-6 rounded-xl bg-black/40 border border-blue-800/30 hover:border-blue-700/50 hover:bg-black/50 transition-all duration-300 relative overflow-hidden cursor-pointer transform hover:translate-y-[-2px]"
          style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.25)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.1)'}>
          {/* Subtle animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-900/10 to-cyan-900/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>

          <div className="flex items-center justify-between relative">
            <div>
              <h3 className="text-lg font-medium text-blue-200 mb-1">Cosmic Insights</h3>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-400">{discoveryPrompts.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' }}>
              <i className="bi bi-lightbulb text-xl text-blue-300 relative z-10"></i>
              <div className="absolute inset-0 bg-blue-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(147, 197, 253, 0.5)'
                }}>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Interests */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-200 relative">
            <span className="relative z-10">Cosmic Discoveries</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <Link
            to="/create-cosmic"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
          >
            <i className="bi bi-plus-lg mr-2"></i>
            <span>Create New</span>
          </Link>
        </div>

        {nodes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-black/60 to-purple-900/20 border border-purple-800/40 text-center relative overflow-hidden group hover:border-purple-700/60 transition-all duration-500"
            style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.15)' }}>
            {/* Enhanced animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i}
                  className="absolute w-2 h-2 rounded-full bg-purple-500/30"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${3 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}>
                </div>
              ))}
            </div>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mx-auto mb-8 relative overflow-hidden transform group-hover:scale-110 transition-all duration-500"
              style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)' }}>
              <i className="bi bi-diagram-3 text-4xl relative z-10 group-hover:animate-pulse"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  boxShadow: 'inset 0 0 25px rgba(192, 132, 252, 0.7)'
                }}>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 mb-4">Your Knowledge Universe Awaits</h3>
            <p className="text-purple-300 mb-8 max-w-md mx-auto text-lg">
              Begin your journey by adding knowledge nodes representing your interests, passions, and areas of curiosity.
            </p>
            <button
              onClick={() => navigate('/create-cosmic')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 inline-flex items-center group-hover:translate-y-0 transform hover:-translate-y-1"
              style={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.5)' }}
            >
              <i className="bi bi-plus-circle mr-2"></i>
              Create Your First Knowledge Node
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.slice(0, 3).map(node => {
              // Calculate connection count for this node
              const nodeConnectionCount = connections.filter(conn =>
                conn.source_node_id === node.id || conn.target_node_id === node.id
              ).length;

              return (
                <InterestNode
                  key={node.id}
                  node={node}
                  onEdit={() => {}}
                  onDelete={async (nodeId) => {
                    try {
                      const { success } = await deleteInterestNode(nodeId);
                      if (success) {
                        setNodes(prev => prev.filter(n => n.id !== nodeId));
                        toast.success('Interest node deleted successfully');
                      }
                    } catch (error) {
                      console.error('Error deleting node:', error);
                      toast.error('Failed to delete interest node');
                    }
                  }}
                  onSelect={() => {}}
                  connectionCount={nodeConnectionCount}
                />
              );
            })}

            {nodes.length > 3 && (
              <Link
                to="/map"
                className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed border-purple-800/30 rounded-xl hover:border-purple-600/50 hover:bg-purple-900/10 transition-all duration-300 group relative overflow-hidden"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.1)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 to-indigo-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-center relative z-10">
                  <i className="bi bi-stars text-2xl text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300"></i>
                  <p className="text-purple-300 font-medium">Explore All Knowledge Nodes</p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Recent Connections */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-200 relative">
            <span className="relative z-10">Cosmic Connections</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <Link to="/cosmic-connections" className="text-purple-300 hover:text-purple-100 font-medium flex items-center group cursor-pointer">
            <span>View All</span>
            <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
          </Link>
        </div>

        {connections.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-black/60 to-indigo-900/20 border border-indigo-800/40 text-center relative overflow-hidden group hover:border-indigo-700/60 transition-all duration-500"
            style={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)' }}>
            {/* Enhanced animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

            {/* Animated connection lines */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i}
                  className="absolute h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"
                  style={{
                    top: `${20 + (i * 30)}%`,
                    left: '0',
                    right: '0',
                    animation: `moveLeftRight ${5 + i}s linear infinite`,
                    animationDelay: `${i * 1.5}s`
                  }}>
                </div>
              ))}
            </div>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-8 relative overflow-hidden transform group-hover:scale-110 transition-all duration-500"
              style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' }}>
              <i className="bi bi-link-45deg text-4xl relative z-10 group-hover:rotate-12 transition-transform duration-300"></i>
              <div className="absolute inset-0 bg-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  boxShadow: 'inset 0 0 25px rgba(165, 180, 252, 0.7)'
                }}>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 mb-4">Discover Celestial Connections</h3>
            <p className="text-indigo-300 mb-8 max-w-md mx-auto text-lg">
              Explore how your cosmic nodes interconnect and reveal hidden patterns across your universe of knowledge.
            </p>
            <button
              onClick={() => navigate('/cosmic-connections')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 inline-flex items-center group-hover:translate-y-0 transform hover:-translate-y-1"
              style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5)' }}
            >
              <i className="bi bi-stars mr-2"></i>
              Discover Cosmic Connections
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.slice(0, 3).map(connection => {
              const { sourceNode, targetNode } = getNodesForConnection(connection)
              if (!sourceNode || !targetNode) return null;
              return (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Discovery Prompts */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-200 relative">
            <span className="relative z-10">Cosmic Insights</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <Link to="/cosmic-insights" className="text-purple-300 hover:text-purple-100 font-medium flex items-center group cursor-pointer">
            <span>View All</span>
            <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
          </Link>
        </div>

        {discoveryPrompts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-black/60 to-fuchsia-900/20 border border-fuchsia-800/40 text-center relative overflow-hidden group hover:border-fuchsia-700/60 transition-all duration-500"
            style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)' }}>
            {/* Enhanced animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-900/20 to-purple-900/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

            {/* Animated light rays */}
            <div className="absolute inset-0 overflow-hidden opacity-30 group-hover:opacity-50 transition-opacity duration-500">
              {[...Array(6)].map((_, i) => (
                <div key={i}
                  className="absolute w-1 h-40 bg-gradient-to-t from-fuchsia-500/0 via-fuchsia-500/70 to-fuchsia-500/0 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-50%)`,
                    transformOrigin: 'center bottom',
                    animation: `pulse ${3 + Math.random() * 2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.5}s`
                  }}>
                </div>
              ))}
            </div>

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-8 relative overflow-hidden transform group-hover:scale-110 transition-all duration-500"
              style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}>
              <i className="bi bi-lightbulb text-4xl relative z-10"></i>
              <div className="absolute inset-0 bg-fuchsia-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"
                style={{
                  animationDuration: '2s',
                  boxShadow: 'inset 0 0 25px rgba(217, 70, 239, 0.7)'
                }}>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-purple-200 mb-4">Unlock Cosmic Insights</h3>
            <p className="text-fuchsia-300 mb-8 max-w-md mx-auto text-lg">
              Generate AI-powered insights to explore new dimensions and undiscovered territories in your cosmic knowledge universe.
            </p>
            <button
              onClick={() => navigate('/cosmic-insights')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-lg font-medium hover:from-fuchsia-500 hover:to-purple-500 transition-all duration-300 inline-flex items-center group-hover:translate-y-0 transform hover:-translate-y-1"
              style={{ boxShadow: '0 4px 20px rgba(168, 85, 247, 0.5)' }}
            >
              <i className="bi bi-sparkle mr-2"></i>
              Generate New Insights
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discoveryPrompts.slice(0, 4).map(prompt => (
              <DiscoveryPrompt
                key={prompt.id}
                prompt={prompt}
                onDelete={(deletedId) => {
                  // Update the state to remove the deleted prompt
                  setDiscoveryPrompts(prevPrompts => prevPrompts.filter(p => p.id !== deletedId));
                  // Show success message
                  toast.success('Cosmic Discovery deleted successfully');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* No modals - using dedicated pages instead */}
    </div>
  )
}

export default Dashboard
