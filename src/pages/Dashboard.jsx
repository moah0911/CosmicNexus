import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchInterestNodes, fetchConnections, fetchDiscoveryPrompts, createInterestNode, deleteInterestNode } from '../services/interestService'
import InterestNode from '../components/InterestNode'
import ConnectionCard from '../components/ConnectionCard'
import DiscoveryPrompt from '../components/DiscoveryPrompt'
import Modal from '../components/Modal'
import InterestNodeForm from '../components/InterestNodeForm'

const Dashboard = () => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [discoveryPrompts, setDiscoveryPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
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
  
  const handleAddInterest = async (nodeData) => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Creating your cosmic node...');
      
      // Call API to create node
      const { success, data, error, duplicates } = await createInterestNode(nodeData);
      
      if (success) {
        setNodes(prev => [data, ...prev]);
        toast.dismiss(loadingToastId);
        toast.success('Interest added successfully!');
        setIsModalOpen(false);
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
          toast.error(error?.message || 'Failed to add interest');
        }
      }
    } catch (error) {
      console.error('Error adding interest:', error);
      toast.error('An unexpected error occurred');
    }
  }
  
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
              to="/map"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 group"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
            >
              <i className="bi bi-stars mr-2"></i>
              <span>Explore Your Cosmic Universe</span>
              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-white/20 text-white">New</span>
              <i className="bi bi-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-xl bg-black/40 border border-purple-800/30 hover:border-purple-700/50 transition-all duration-300 relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
          {/* Subtle animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
          
          <div className="flex items-center justify-between relative">
            <div>
              <h3 className="text-lg font-medium text-purple-200 mb-1">Cosmic Nodes</h3>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-400">{nodes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.2)' }}>
              <i className="bi bi-stars text-xl text-purple-300 relative z-10"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                style={{ 
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                }}>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/map" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center group">
              <span>Explore Your Nodes</span>
              <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-black/40 border border-indigo-800/30 hover:border-indigo-700/50 transition-all duration-300 relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' }}>
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
          <div className="mt-4">
            <Link to="/connections" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center group">
              <span>View Connections</span>
              <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-black/40 border border-blue-800/30 hover:border-blue-700/50 transition-all duration-300 relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}>
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
          <div className="mt-4">
            <Link to="/connections" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center group">
              <span>Generate New Insights</span>
              <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Interests */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-200 relative">
            <span className="relative z-10">Cosmic Discoveries</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
          >
            <i className="bi bi-plus-lg mr-2"></i>
            <span>Add Cosmic Node</span>
          </button>
        </div>
        
        {nodes.length === 0 ? (
          <div className="p-8 rounded-xl bg-black/40 border border-purple-800/30 text-center relative overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
            {/* Subtle animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 rounded-xl blur-xl opacity-50"></div>
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
              <i className="bi bi-stars text-3xl relative z-10"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                style={{ 
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                }}>
              </div>
            </div>
            <h3 className="text-xl font-medium text-purple-200 mb-3">Your Cosmic Universe Awaits</h3>
            <p className="text-purple-300 mb-6 max-w-md mx-auto">
              Begin your journey by adding celestial nodes representing your interests, passions, and areas of curiosity.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
            >
              Create Your First Cosmic Node
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
                  <p className="text-purple-300 font-medium">Explore All Cosmic Nodes</p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
      
      {/* Recent Connections */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-800 relative">
            <span className="relative z-10">Celestial Connections</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          </h2>
          <Link to="/connections" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group">
            <span>View All</span>
            <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
          </Link>
        </div>
        
        {connections.length === 0 ? (
          <div className="p-8 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-center relative overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)' }}>
            {/* Subtle animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-xl blur-xl opacity-50"></div>
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
              <i className="bi bi-link-45deg text-3xl relative z-10"></i>
              <div className="absolute inset-0 bg-white opacity-0 animate-pulse"
                style={{ 
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(165, 180, 252, 0.5)'
                }}>
              </div>
            </div>
            <h3 className="text-xl font-medium text-indigo-800 mb-3">Discover Celestial Connections</h3>
            <p className="text-indigo-700 mb-6 max-w-md mx-auto">
              Explore how your cosmic nodes interconnect and reveal hidden patterns across your universe of knowledge.
            </p>
            <Link to="/map" 
              className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 inline-block"
              style={{ boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
            >
              Discover Cosmic Connections
            </Link>
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
          <h2 className="text-2xl font-bold text-indigo-800 relative">
            <span className="relative z-10">Cosmic Insights</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <Link to="/connections" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group">
            <span>Generate New</span>
            <i className="bi bi-arrow-right ml-1 transition-transform duration-300 group-hover:translate-x-1"></i>
          </Link>
        </div>
        
        {discoveryPrompts.length === 0 ? (
          <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-center relative overflow-hidden"
            style={{ boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15)' }}>
            {/* Subtle animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/20 to-indigo-200/20 rounded-xl blur-xl opacity-50"></div>
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}>
              <i className="bi bi-lightbulb text-3xl relative z-10"></i>
              <div className="absolute inset-0 bg-white opacity-0 animate-pulse"
                style={{ 
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(167, 139, 250, 0.5)'
                }}>
              </div>
            </div>
            <h3 className="text-xl font-medium text-indigo-800 mb-3">Unlock Cosmic Insights</h3>
            <p className="text-indigo-700 mb-6 max-w-md mx-auto">
              Generate AI-powered insights to explore new dimensions and undiscovered territories in your cosmic knowledge universe.
            </p>
            <Link to="/connections" 
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 inline-block"
              style={{ boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}
            >
              Generate Cosmic Insights
            </Link>
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
      
      {/* Add Interest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Cosmic Node"
      >
        <InterestNodeForm
          onSubmit={handleAddInterest}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default Dashboard
