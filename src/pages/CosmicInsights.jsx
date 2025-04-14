import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchDiscoveryPrompts } from '../services/interestService'
import DiscoveryPrompt from '../components/DiscoveryPrompt'

const CosmicInsights = () => {
  // State management
  const [discoveryPrompts, setDiscoveryPrompts] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Load all data from the API
  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch discovery prompts
      const promptsResult = await fetchDiscoveryPrompts()

      if (promptsResult.success) {
        setDiscoveryPrompts(promptsResult.data)
      }
    } catch (error) {
      console.error('Error loading cosmic insights data:', error)
      toast.error('Failed to load your data')
    } finally {
      setLoading(false)
    }
  }

  // Insights generation is now handled in the GenerateInsights page

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
            <i className="bi bi-lightbulb text-3xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-purple-200">Loading cosmic insights...</h2>
        </div>
      </div>
    )
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
          Cosmic Insights
        </h1>
        <p className="text-purple-300 text-lg max-w-2xl"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}>
          Generate AI-powered insights to explore new dimensions and undiscovered territories in your cosmic knowledge universe.
        </p>
      </div>

      {/* Main Content */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-200 relative">
            <span className="relative z-10">Your Cosmic Insights</span>
            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </h2>
          <Link
            to="/generate-insights"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 cursor-pointer"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
          >
            <i className="bi bi-plus-lg mr-2"></i>
            <span>Generate New Insights</span>
          </Link>
        </div>

        {discoveryPrompts.length === 0 ? (
          <div className="p-8 rounded-xl bg-black/40 border border-purple-800/30 text-center relative overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
            {/* Subtle animated glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 rounded-xl blur-xl opacity-50"></div>

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}>
              <i className="bi bi-lightbulb text-3xl relative z-10"></i>
              <div className="absolute inset-0 bg-purple-400 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(167, 139, 250, 0.5)'
                }}>
              </div>
            </div>
            <h3 className="text-xl font-medium text-purple-200 mb-3">Unlock Cosmic Insights</h3>
            <p className="text-purple-300 mb-6 max-w-md mx-auto">
              Generate AI-powered insights to explore new dimensions and undiscovered territories in your cosmic knowledge universe.
            </p>
            <Link
              to="/generate-insights"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block cursor-pointer"
              style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}
            >
              Generate Cosmic Insights
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discoveryPrompts.map(prompt => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
            ))}
          </div>
        )}
      </div>

      {/* Select Nodes Modal */}
      <Modal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title="Select Knowledge Nodes for Insights"
      >
        <div>
          <p className="text-lg text-purple-300 mb-6 border-l-4 border-purple-600 pl-4 py-2 bg-purple-900/30 rounded-r-lg">
            Select at least two knowledge nodes to generate cosmic insights and discover new connections.
          </p>
          <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/30 text-indigo-300 text-sm">
            <p className="flex items-center">
              <i className="bi bi-info-circle mr-2 text-indigo-400"></i>
              Click on any node below to select it. You need to select at least 2 nodes to generate insights.
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
                onClick={handleGenerateInsights}
                disabled={selectedNodes.length < 2 || isGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer w-full md:w-auto text-center relative overflow-hidden group"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                <div className="relative z-10">
                  {isGenerating ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      <span>Generating Cosmic Insights...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lightbulb mr-2"></i>
                      <span>Generate Cosmic Insights</span>
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
                Please select at least 2 nodes to generate insights
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CosmicInsights
