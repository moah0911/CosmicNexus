import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchInterestNodes, fetchConnections, generateConnections, fetchDiscoveryPrompts } from '../services/interestService'
import ConnectionCard from '../components/ConnectionCard'
import DiscoveryPrompt from '../components/DiscoveryPrompt'
import ConnectionCreator from '../components/ConnectionCreator'
import Modal from '../components/Modal'

const Connections = () => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [discoveryPrompts, setDiscoveryPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNodes, setSelectedNodes] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [generationResults, setGenerationResults] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

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
      console.error('Error loading connections data:', error)
      toast.error('Failed to load your data')
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <i className="bi bi-diagram-3 text-6xl text-primary-500 mb-4"></i>
          <h2 className="text-xl font-medium text-neutral-600">Loading connections...</h2>
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

      <div className="mb-10">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg">
          Cosmic Connections
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}>
          Connections & Discoveries
        </h1>
        <p className="text-lg text-purple-300 max-w-3xl"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}>
          Explore the cosmic web connecting your knowledge nodes and discover new celestial paths for exploration.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-black/40 border border-purple-800/30 p-6 rounded-2xl shadow-md"
        style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
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
      ) : (
        <div className="space-y-6 mb-12">
          {connections.map(connection => {
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

      {/* Discovery Prompts */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium mb-3 shadow-lg">
              Celestial Insights
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400"
              style={{
                textShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                letterSpacing: '0.05em'
              }}>
              Cosmic Discoveries
            </h2>
          </div>
          <button
            onClick={() => setIsSelectModalOpen(true)}
            className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] flex items-center hover:from-indigo-600 hover:to-purple-600 cursor-pointer text-sm"
            style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' }}
          >
            <i className="bi bi-stars mr-2"></i>
            <span>Generate New Discoveries</span>
          </button>
        </div>

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
            {discoveryPrompts.map(prompt => (
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
    </div>
  )
}

export default Connections
