import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchInterestNodes, createInterestNode, createConnection } from '../services/interestService';
import { COSMIC_TYPES, CATEGORY_DISPLAY, RELATIONSHIP_TYPES, RELATIONSHIP_DISPLAY } from '../models/CosmicTypes';

const CreateCosmic = () => {
  const navigate = useNavigate();
  
  // State management
  const [cosmicType, setCosmicType] = useState(COSMIC_TYPES.CONNECTION);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Node form state
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeDescription, setNodeDescription] = useState('');
  const [nodeCategory, setNodeCategory] = useState('other');
  const [nodeNotes, setNodeNotes] = useState('');
  
  // Connection form state
  const [sourceNodeId, setSourceNodeId] = useState('');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [relationshipType, setRelationshipType] = useState(RELATIONSHIP_TYPES.RELATED);
  const [connectionDescription, setConnectionDescription] = useState('');
  const [connectionStrength, setConnectionStrength] = useState(3);

  // Load nodes on component mount
  useEffect(() => {
    loadNodes();
  }, []);

  // Load nodes from API
  const loadNodes = async () => {
    try {
      setLoading(true);
      const result = await fetchInterestNodes();

      if (result.success) {
        setNodes(result.data);
        
        // If we have nodes, set default source and target
        if (result.data.length >= 2) {
          setSourceNodeId(result.data[0].id);
          setTargetNodeId(result.data[1].id);
        }
      }
    } catch (error) {
      console.error('Error loading nodes:', error);
      toast.error('Failed to load knowledge nodes');
    } finally {
      setLoading(false);
    }
  };

  // Handle node creation
  const handleCreateNode = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!nodeTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!nodeDescription.trim()) {
      toast.error('Description is required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const nodeData = {
        title: nodeTitle.trim(),
        description: nodeDescription.trim(),
        category: nodeCategory,
        notes: nodeNotes.trim()
      };
      
      const { success, data, error } = await createInterestNode(nodeData);
      
      if (success) {
        toast.success('Knowledge node created successfully');
        
        // Reset form
        setNodeTitle('');
        setNodeDescription('');
        setNodeCategory('other');
        setNodeNotes('');
        
        // Reload nodes
        await loadNodes();
        
        // Navigate to the new node
        navigate(`/node/${data.id}`);
      } else {
        toast.error(error?.message || 'Failed to create node');
      }
    } catch (error) {
      console.error('Error creating node:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle connection creation
  const handleCreateConnection = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!sourceNodeId) {
      toast.error('Source node is required');
      return;
    }
    
    if (!targetNodeId) {
      toast.error('Target node is required');
      return;
    }
    
    if (sourceNodeId === targetNodeId) {
      toast.error('Source and target nodes must be different');
      return;
    }
    
    if (!connectionDescription.trim()) {
      toast.error('Description is required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const connectionData = {
        source_node_id: sourceNodeId,
        target_node_id: targetNodeId,
        relationship_type: relationshipType,
        description: connectionDescription.trim(),
        strength: connectionStrength
      };
      
      const { success, data, error } = await createConnection(connectionData);
      
      if (success) {
        toast.success('Connection created successfully');
        
        // Reset form
        setConnectionDescription('');
        setRelationshipType(RELATIONSHIP_TYPES.RELATED);
        setConnectionStrength(3);
        
        // Navigate to connections page
        navigate('/cosmic-connections');
      } else {
        toast.error(error?.message || 'Failed to create connection');
      }
    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
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
            <i className="bi bi-plus-lg text-2xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-purple-200">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}
        >
          Create Cosmic Entity
        </motion.h1>
        <motion.p 
          className="text-purple-300 text-lg max-w-3xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}
        >
          Add new elements to your cosmic universe by creating knowledge nodes or connections.
        </motion.p>
      </div>

      {/* Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setCosmicType(COSMIC_TYPES.CONNECTION)}
            className={`px-6 py-3 rounded-xl flex items-center transition-all duration-300 ${
              cosmicType === COSMIC_TYPES.CONNECTION
                ? 'bg-gradient-to-r from-indigo-700 to-blue-700 text-white shadow-lg'
                : 'bg-black/40 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/30'
            }`}
            style={cosmicType === COSMIC_TYPES.CONNECTION ? { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' } : {}}
          >
            <i className="bi bi-link-45deg text-xl mr-2"></i>
            <span>Connection</span>
          </button>
          <button
            onClick={() => setCosmicType(COSMIC_TYPES.DISCOVERY)}
            className={`px-6 py-3 rounded-xl flex items-center transition-all duration-300 ${
              cosmicType === COSMIC_TYPES.DISCOVERY
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg'
                : 'bg-black/40 text-purple-300 border border-purple-700/50 hover:bg-purple-900/30'
            }`}
            style={cosmicType === COSMIC_TYPES.DISCOVERY ? { boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' } : {}}
          >
            <i className="bi bi-diagram-3 text-xl mr-2"></i>
            <span>Knowledge Node</span>
          </button>
        </div>
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`bg-black/40 backdrop-blur-md rounded-2xl border shadow-xl overflow-hidden ${
          cosmicType === COSMIC_TYPES.CONNECTION
            ? 'border-indigo-900/50'
            : 'border-purple-900/50'
        }`}
        style={{ 
          boxShadow: cosmicType === COSMIC_TYPES.CONNECTION
            ? '0 10px 40px rgba(99, 102, 241, 0.2)'
            : '0 10px 40px rgba(124, 58, 237, 0.2)'
        }}
      >
        <div className="p-6 md:p-8">
          {cosmicType === COSMIC_TYPES.DISCOVERY ? (
            <form onSubmit={handleCreateNode}>
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="nodeTitle" className="block text-base font-medium text-white mb-2">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="nodeTitle"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                  placeholder="Enter a title for your knowledge node"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label htmlFor="nodeCategory" className="block text-base font-medium text-white mb-2">
                  Category
                </label>
                <select
                  id="nodeCategory"
                  value={nodeCategory}
                  onChange={(e) => setNodeCategory(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                >
                  {Object.entries(CATEGORY_DISPLAY).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="nodeDescription" className="block text-base font-medium text-white mb-2">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="nodeDescription"
                  value={nodeDescription}
                  onChange={(e) => setNodeDescription(e.target.value)}
                  rows="5"
                  className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                  placeholder="Describe this knowledge node in detail"
                  required
                ></textarea>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="nodeNotes" className="block text-base font-medium text-white mb-2">
                  Personal Notes
                </label>
                <textarea
                  id="nodeNotes"
                  value={nodeNotes}
                  onChange={(e) => setNodeNotes(e.target.value)}
                  rows="4"
                  className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                  placeholder="Add any personal notes or thoughts about this node (optional)"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-purple-800/30">
                <Link
                  to="/cosmic-discoveries"
                  className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 text-center"
                >
                  <i className="bi bi-x-circle mr-2"></i> Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer text-center relative overflow-hidden group"
                  style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                  <div className="relative z-10">
                    {submitting ? (
                      <>
                        <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                        Creating Node...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle mr-2"></i>
                        Create Node
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateConnection}>
              {nodes.length < 2 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-4">
                    <i className="bi bi-exclamation-triangle text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-indigo-200 mb-3">Not Enough Nodes</h3>
                  <p className="text-indigo-300 mb-6 max-w-md mx-auto">
                    You need at least two knowledge nodes to create a connection. Please create more nodes first.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCosmicType(COSMIC_TYPES.DISCOVERY)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block"
                  >
                    <i className="bi bi-plus-circle mr-2"></i>
                    Create a Node
                  </button>
                </div>
              ) : (
                <>
                  {/* Source Node */}
                  <div className="mb-6">
                    <label htmlFor="sourceNodeId" className="block text-base font-medium text-white mb-2">
                      Source Node <span className="text-rose-400">*</span>
                    </label>
                    <select
                      id="sourceNodeId"
                      value={sourceNodeId}
                      onChange={(e) => setSourceNodeId(e.target.value)}
                      className="w-full px-5 py-3 rounded-xl border-2 border-indigo-700 focus:border-indigo-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                      required
                    >
                      <option value="">Select a source node</option>
                      {nodes.map(node => (
                        <option key={`source-${node.id}`} value={node.id}>{node.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Relationship Type */}
                  <div className="mb-6">
                    <label htmlFor="relationshipType" className="block text-base font-medium text-white mb-2">
                      Relationship Type
                    </label>
                    <select
                      id="relationshipType"
                      value={relationshipType}
                      onChange={(e) => setRelationshipType(e.target.value)}
                      className="w-full px-5 py-3 rounded-xl border-2 border-indigo-700 focus:border-indigo-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                    >
                      {Object.entries(RELATIONSHIP_DISPLAY).map(([key, { name }]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-indigo-400 text-sm">
                      {RELATIONSHIP_DISPLAY[relationshipType]?.description}
                    </p>
                  </div>

                  {/* Target Node */}
                  <div className="mb-6">
                    <label htmlFor="targetNodeId" className="block text-base font-medium text-white mb-2">
                      Target Node <span className="text-rose-400">*</span>
                    </label>
                    <select
                      id="targetNodeId"
                      value={targetNodeId}
                      onChange={(e) => setTargetNodeId(e.target.value)}
                      className="w-full px-5 py-3 rounded-xl border-2 border-indigo-700 focus:border-indigo-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                      required
                    >
                      <option value="">Select a target node</option>
                      {nodes.map(node => (
                        <option 
                          key={`target-${node.id}`} 
                          value={node.id}
                          disabled={node.id === sourceNodeId}
                        >
                          {node.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Connection Strength */}
                  <div className="mb-6">
                    <label htmlFor="connectionStrength" className="block text-base font-medium text-white mb-2">
                      Connection Strength: {connectionStrength}
                    </label>
                    <input
                      type="range"
                      id="connectionStrength"
                      min="1"
                      max="5"
                      value={connectionStrength}
                      onChange={(e) => setConnectionStrength(parseInt(e.target.value))}
                      className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-indigo-400 mt-1">
                      <span>Weak</span>
                      <span>Strong</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label htmlFor="connectionDescription" className="block text-base font-medium text-white mb-2">
                      Description <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      id="connectionDescription"
                      value={connectionDescription}
                      onChange={(e) => setConnectionDescription(e.target.value)}
                      rows="4"
                      className="w-full px-5 py-3 rounded-xl border-2 border-indigo-700 focus:border-indigo-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                      placeholder="Describe how these nodes are connected"
                      required
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-indigo-800/30">
                    <Link
                      to="/cosmic-connections"
                      className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-300 hover:bg-indigo-900/30 transition-all duration-300 text-center"
                    >
                      <i className="bi bi-x-circle mr-2"></i> Cancel
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={submitting || !sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-indigo-600 hover:to-blue-600 cursor-pointer text-center relative overflow-hidden group"
                      style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                      <div className="relative z-10">
                        {submitting ? (
                          <>
                            <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                            Creating Connection...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle mr-2"></i>
                            Create Connection
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCosmic;
