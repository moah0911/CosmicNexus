import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchInterestNodes, createConnection } from '../services/interestService';
import { RELATIONSHIP_TYPES, RELATIONSHIP_DISPLAY, getCategoryIcon } from '../models/CosmicTypes';

const CreateConnection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get preselected node ID from location state if available
  const preselectedNodeId = location.state?.preselectedNodeId || '';
  
  // State management
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [sourceNodeId, setSourceNodeId] = useState(preselectedNodeId);
  const [targetNodeId, setTargetNodeId] = useState('');
  const [relationshipType, setRelationshipType] = useState(RELATIONSHIP_TYPES.RELATED);
  const [description, setDescription] = useState('');
  const [strength, setStrength] = useState(3);
  
  // UI state
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [step, setStep] = useState(1); // 1: Select nodes, 2: Define relationship

  // Load nodes on component mount
  useEffect(() => {
    loadNodes();
  }, []);

  // Update source and target nodes when IDs change
  useEffect(() => {
    if (sourceNodeId) {
      const node = nodes.find(n => n.id === sourceNodeId);
      setSourceNode(node);
    } else {
      setSourceNode(null);
    }
  }, [sourceNodeId, nodes]);

  useEffect(() => {
    if (targetNodeId) {
      const node = nodes.find(n => n.id === targetNodeId);
      setTargetNode(node);
    } else {
      setTargetNode(null);
    }
  }, [targetNodeId, nodes]);

  // Load nodes from API
  const loadNodes = async () => {
    try {
      setLoading(true);
      const result = await fetchInterestNodes();

      if (result.success) {
        setNodes(result.data);
        
        // If we have a preselected node and at least one other node, set the target node
        if (preselectedNodeId && result.data.length > 1) {
          // Find the first node that isn't the preselected node
          const otherNode = result.data.find(node => node.id !== preselectedNodeId);
          if (otherNode) {
            setTargetNodeId(otherNode.id);
          }
        }
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!sourceNodeId) {
      toast.error('Please select a source node');
      return;
    }
    
    if (!targetNodeId) {
      toast.error('Please select a target node');
      return;
    }
    
    if (sourceNodeId === targetNodeId) {
      toast.error('Source and target nodes must be different');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a description for this connection');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const connectionData = {
        source_node_id: sourceNodeId,
        target_node_id: targetNodeId,
        relationship_type: relationshipType,
        description: description.trim(),
        strength
      };
      
      const { success, data, error } = await createConnection(connectionData);
      
      if (success) {
        toast.success('Connection created successfully');
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

  // Handle next step
  const handleNextStep = () => {
    if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
      toast.error('Please select two different nodes');
      return;
    }
    
    setStep(2);
  };

  // Handle back step
  const handleBackStep = () => {
    setStep(1);
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
          <h2 className="text-xl font-medium text-indigo-200">Loading nodes...</h2>
        </div>
      </div>
    );
  }

  // Not enough nodes
  if (nodes.length < 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-8 rounded-xl bg-black/40 border border-indigo-800/30 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-4">
            <i className="bi bi-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className="text-xl font-medium text-indigo-200 mb-3">Not Enough Nodes</h3>
          <p className="text-indigo-300 mb-6 max-w-md mx-auto">
            You need at least two knowledge nodes to create a connection. Please create more nodes first.
          </p>
          <Link to="/create-node" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block">
            Create a Node
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/cosmic-connections"
          className="inline-flex items-center text-indigo-300 hover:text-indigo-200 transition-colors duration-300"
        >
          <i className="bi bi-arrow-left mr-2"></i>
          <span>Back to Connections</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-blue-400 to-indigo-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            letterSpacing: '0.05em'
          }}
        >
          Create Connection
        </motion.h1>
        <motion.p 
          className="text-indigo-300 text-lg max-w-3xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            textShadow: '0 0 10px rgba(99, 102, 241, 0.2)',
            lineHeight: '1.6'
          }}
        >
          Connect knowledge nodes to build your cosmic web of ideas and discover new relationships.
        </motion.p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            step === 1 ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-indigo-900/50 text-indigo-300'
          }`}>
            <span>1</span>
          </div>
          <div className={`h-1 flex-grow mx-2 ${
            step === 1 ? 'bg-gradient-to-r from-blue-600/50 to-indigo-600/20' : 'bg-indigo-900/50'
          }`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 2 ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' : 'bg-indigo-900/50 text-indigo-300'
          }`}>
            <span>2</span>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className={`text-sm ${step === 1 ? 'text-indigo-300' : 'text-indigo-500'}`}>Select Nodes</span>
          <span className={`text-sm ${step === 2 ? 'text-indigo-300' : 'text-indigo-500'}`}>Define Relationship</span>
        </div>
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-black/40 backdrop-blur-md rounded-2xl border border-indigo-900/50 shadow-xl overflow-hidden"
        style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)' }}
      >
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div>
                <h2 className="text-xl font-bold text-indigo-200 mb-6">Step 1: Select Nodes to Connect</h2>
                
                {/* Source Node */}
                <div className="mb-6">
                  <label htmlFor="sourceNodeId" className="block text-base font-medium text-white mb-2">
                    Source Node <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="sourceNodeId"
                    value={sourceNodeId}
                    onChange={(e) => {
                      setSourceNodeId(e.target.value);
                      // If target is the same as new source, clear target
                      if (e.target.value === targetNodeId) {
                        setTargetNodeId('');
                      }
                    }}
                    className="w-full px-5 py-3 rounded-xl border-2 border-indigo-700 focus:border-indigo-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                    required
                  >
                    <option value="">Select a source node</option>
                    {nodes.map(node => (
                      <option key={`source-${node.id}`} value={node.id}>{node.title}</option>
                    ))}
                  </select>
                </div>

                {/* Source Node Preview */}
                {sourceNode && (
                  <div className="mb-6 p-4 rounded-xl bg-black/60 border border-indigo-800/30">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-3">
                        <i className={`bi ${getCategoryIcon(sourceNode.category)} text-sm`}></i>
                      </div>
                      <h3 className="font-bold text-indigo-200">{sourceNode.title}</h3>
                    </div>
                    <p className="text-indigo-300 text-sm line-clamp-2">{sourceNode.description}</p>
                  </div>
                )}

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

                {/* Target Node Preview */}
                {targetNode && (
                  <div className="mb-6 p-4 rounded-xl bg-black/60 border border-indigo-800/30">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-3">
                        <i className={`bi ${getCategoryIcon(targetNode.category)} text-sm`}></i>
                      </div>
                      <h3 className="font-bold text-indigo-200">{targetNode.title}</h3>
                    </div>
                    <p className="text-indigo-300 text-sm line-clamp-2">{targetNode.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end mt-8 pt-6 border-t border-indigo-800/30">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-indigo-600 hover:to-blue-600 cursor-pointer text-center relative overflow-hidden group"
                    style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                    <div className="relative z-10">
                      <span>Next: Define Relationship</span>
                      <i className="bi bi-arrow-right ml-2"></i>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-indigo-200 mb-6">Step 2: Define the Relationship</h2>
                
                {/* Connection Preview */}
                <div className="mb-6 p-4 rounded-xl bg-black/60 border border-indigo-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-3">
                        <i className={`bi ${getCategoryIcon(sourceNode.category)} text-lg`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-indigo-200">{sourceNode.title}</h3>
                        <span className="text-xs text-indigo-400">{sourceNode.category}</span>
                      </div>
                    </div>
                    
                    <div className="px-3 py-1.5 rounded-full bg-indigo-900/30 text-indigo-300 text-sm border border-indigo-700/30 flex items-center">
                      <i className={`bi ${RELATIONSHIP_DISPLAY[relationshipType]?.icon || 'bi-link'} mr-1.5`}></i>
                      <span>{RELATIONSHIP_DISPLAY[relationshipType]?.name || 'Related'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div>
                        <h3 className="font-bold text-indigo-200 text-right">{targetNode.title}</h3>
                        <span className="text-xs text-indigo-400 text-right block">{targetNode.category}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white ml-3">
                        <i className={`bi ${getCategoryIcon(targetNode.category)} text-lg`}></i>
                      </div>
                    </div>
                  </div>
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

                {/* Connection Strength */}
                <div className="mb-6">
                  <label htmlFor="strength" className="block text-base font-medium text-white mb-2">
                    Connection Strength: {strength}
                  </label>
                  <input
                    type="range"
                    id="strength"
                    min="1"
                    max="5"
                    value={strength}
                    onChange={(e) => setStrength(parseInt(e.target.value))}
                    className="w-full h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-indigo-400 mt-1">
                    <span>Weak</span>
                    <span>Strong</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-base font-medium text-white mb-2">
                    Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full px-5 py-3 rounded-xl border-2 border-indigo-700 focus:border-indigo-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                    placeholder="Describe how these nodes are connected"
                    required
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-indigo-800/30">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-300 hover:bg-indigo-900/30 transition-all duration-300 text-center"
                  >
                    <i className="bi bi-arrow-left mr-2"></i> Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting || !description.trim()}
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
                          <i className="bi bi-check-circle mr-2"></i>
                          Create Connection
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateConnection;
