import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchInterestNodeById, fetchNodeConnections, deleteInterestNode } from '../services/interestService';
import { getCategoryIcon, CATEGORY_DISPLAY } from '../models/CosmicTypes';
import Modal from '../components/Modal';

const NodeDetails = () => {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [node, setNode] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // Load data on component mount
  useEffect(() => {
    if (nodeId) {
      loadData();
    }
  }, [nodeId]);

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch node details and connections in parallel
      const [nodeResult, connectionsResult] = await Promise.all([
        fetchInterestNodeById(nodeId),
        fetchNodeConnections(nodeId)
      ]);

      if (nodeResult.success) {
        setNode(nodeResult.data);
        setEditedNotes(nodeResult.data.notes || '');
      } else {
        toast.error('Failed to load node details');
        navigate('/cosmic-discoveries');
      }

      if (connectionsResult.success) {
        setConnections(connectionsResult.data);
      }
    } catch (error) {
      console.error('Error loading node data:', error);
      toast.error('An unexpected error occurred');
      navigate('/cosmic-discoveries');
    } finally {
      setLoading(false);
    }
  };

  // Handle node deletion
  const handleDeleteNode = async () => {
    try {
      const { success, error } = await deleteInterestNode(nodeId);

      if (success) {
        toast.success('Knowledge node deleted successfully');
        navigate('/cosmic-discoveries');
      } else {
        toast.error(error?.message || 'Failed to delete node');
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // Handle notes update
  const handleUpdateNotes = async () => {
    try {
      // Call API to update notes
      // This is a placeholder - you'll need to implement the actual API call
      // const { success } = await updateNodeNotes(nodeId, editedNotes);
      
      // For now, just update the local state
      setNode(prev => ({ ...prev, notes: editedNotes }));
      setIsEditMode(false);
      toast.success('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
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
            <i className="bi bi-diagram-3 text-2xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h2 className="text-xl font-medium text-purple-200">Loading node details...</h2>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="p-8 rounded-xl bg-black/40 border border-purple-800/30 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4">
          <i className="bi bi-exclamation-triangle text-2xl"></i>
        </div>
        <h3 className="text-xl font-medium text-purple-200 mb-3">Node Not Found</h3>
        <p className="text-purple-300 mb-6 max-w-md mx-auto">
          The knowledge node you're looking for could not be found. It may have been deleted or you may not have access to it.
        </p>
        <Link to="/cosmic-discoveries" className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block">
          Return to Discoveries
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/cosmic-discoveries"
          className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors duration-300"
        >
          <i className="bi bi-arrow-left mr-2"></i>
          <span>Back to Discoveries</span>
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Node Info */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-2xl border border-purple-900/50 shadow-xl overflow-hidden"
          style={{ boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)' }}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-white mr-4 relative overflow-hidden"
                  style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}>
                  <i className={`bi ${getCategoryIcon(node.category)} text-2xl relative z-10`}></i>
                  <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                    style={{
                      animationDuration: '3s',
                      boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                    }}>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-purple-200">{node.title}</h1>
                  <div className="flex items-center mt-1">
                    <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-sm border border-purple-700/30 capitalize">
                      {CATEGORY_DISPLAY[node.category]?.name || node.category || 'Other'}
                    </span>
                    <span className="text-purple-400 text-sm ml-3">
                      <i className="bi bi-calendar-event mr-1.5"></i>
                      {new Date(node.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit-node/${nodeId}`}
                  className="text-purple-400 hover:text-purple-300 bg-black/60 rounded-full w-10 h-10 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-purple-700/30"
                  title="Edit node"
                >
                  <i className="bi bi-pencil"></i>
                </Link>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-red-400 hover:text-red-300 bg-black/60 rounded-full w-10 h-10 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-red-700/30"
                  title="Delete node"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div className="bg-black/60 p-6 rounded-xl shadow-sm border border-purple-800/30 mb-6">
              <h2 className="text-xl font-bold text-purple-200 mb-3">Description</h2>
              <p className="text-purple-300 leading-relaxed whitespace-pre-line">{node.description}</p>
            </div>

            <div className="bg-black/60 p-6 rounded-xl shadow-sm border border-purple-800/30">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-purple-200">Notes</h2>
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="text-purple-400 hover:text-purple-300 flex items-center text-sm"
                  >
                    <i className="bi bi-pencil mr-1"></i>
                    <span>Edit Notes</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditedNotes(node.notes || '');
                      }}
                      className="text-purple-400 hover:text-purple-300 flex items-center text-sm"
                    >
                      <i className="bi bi-x-circle mr-1"></i>
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleUpdateNotes}
                      className="text-green-400 hover:text-green-300 flex items-center text-sm"
                    >
                      <i className="bi bi-check-circle mr-1"></i>
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>
              
              {isEditMode ? (
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full h-40 px-4 py-3 rounded-lg border-2 border-purple-700/50 focus:border-purple-500 bg-black/60 text-purple-200 placeholder-purple-400/70"
                  placeholder="Add your notes about this knowledge node..."
                ></textarea>
              ) : (
                <div className="text-purple-300 leading-relaxed whitespace-pre-line min-h-[100px]">
                  {node.notes || <span className="text-purple-400 italic">No notes added yet.</span>}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          variants={itemVariants}
          className="space-y-6"
        >
          {/* Connections */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-indigo-900/50 shadow-xl overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-indigo-200">Connections</h2>
                <Link
                  to="/create-connection"
                  state={{ preselectedNodeId: nodeId }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center text-sm"
                >
                  <i className="bi bi-plus-circle mr-1"></i>
                  <span>Add</span>
                </Link>
              </div>

              {connections.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-3">
                    <i className="bi bi-link-45deg text-xl"></i>
                  </div>
                  <p className="text-indigo-300 mb-4">No connections yet</p>
                  <Link
                    to="/create-connection"
                    state={{ preselectedNodeId: nodeId }}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 inline-block"
                  >
                    Create Connection
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {connections.map(connection => (
                    <div
                      key={connection.id}
                      className="bg-black/60 p-3 rounded-lg border border-indigo-800/30 hover:border-indigo-700/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-700 to-blue-700 flex items-center justify-center text-white mr-2">
                            <i className="bi bi-link-45deg text-sm"></i>
                          </div>
                          <span className="text-indigo-300 font-medium">
                            {connection.source_node_id === nodeId ? connection.target_name : connection.source_name}
                          </span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300 text-xs border border-indigo-700/30">
                          {connection.relationship_type || 'related'}
                        </div>
                      </div>
                      <p className="text-indigo-400 text-sm line-clamp-2">{connection.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Insights */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-blue-900/50 shadow-xl overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-200">Related Insights</h2>
                <Link
                  to="/generate-insights"
                  state={{ preselectedNodeIds: [nodeId] }}
                  className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                >
                  <i className="bi bi-plus-circle mr-1"></i>
                  <span>Generate</span>
                </Link>
              </div>

              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-3">
                  <i className="bi bi-lightbulb text-xl"></i>
                </div>
                <p className="text-blue-300 mb-4">Generate insights with this node</p>
                <Link
                  to="/generate-insights"
                  state={{ preselectedNodeIds: [nodeId] }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 inline-block"
                >
                  Generate Insights
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-purple-900/50 shadow-xl overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)' }}>
            <div className="p-5">
              <h2 className="text-xl font-bold text-purple-200 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/map"
                  state={{ focusNodeId: nodeId }}
                  className="flex items-center justify-between p-3 bg-black/60 rounded-lg border border-purple-800/30 hover:border-purple-700/50 transition-all duration-300 text-purple-300 hover:text-purple-200"
                >
                  <span className="flex items-center">
                    <i className="bi bi-diagram-3 mr-2 text-lg"></i>
                    <span>View on Knowledge Map</span>
                  </span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <Link
                  to="/create-connection"
                  state={{ preselectedNodeId: nodeId }}
                  className="flex items-center justify-between p-3 bg-black/60 rounded-lg border border-purple-800/30 hover:border-purple-700/50 transition-all duration-300 text-purple-300 hover:text-purple-200"
                >
                  <span className="flex items-center">
                    <i className="bi bi-link-45deg mr-2 text-lg"></i>
                    <span>Create Connection</span>
                  </span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <Link
                  to="/generate-insights"
                  state={{ preselectedNodeIds: [nodeId] }}
                  className="flex items-center justify-between p-3 bg-black/60 rounded-lg border border-purple-800/30 hover:border-purple-700/50 transition-all duration-300 text-purple-300 hover:text-purple-200"
                >
                  <span className="flex items-center">
                    <i className="bi bi-lightbulb mr-2 text-lg"></i>
                    <span>Generate Insights</span>
                  </span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Knowledge Node"
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
            Are you sure you want to delete this knowledge node? This will also delete all connections associated with this node. This action cannot be undone.
          </p>

          <div className="bg-black/60 p-4 rounded-xl shadow-sm border border-purple-800/30 mb-6">
            <h4 className="font-bold text-purple-200 mb-2">{node.title}</h4>
            <p className="text-purple-300 text-sm line-clamp-3">{node.description}</p>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 min-w-[120px]"
            >
              <i className="bi bi-arrow-left mr-2"></i> Cancel
            </button>
            <button
              onClick={handleDeleteNode}
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

export default NodeDetails;
