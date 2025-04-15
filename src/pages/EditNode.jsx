import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { fetchInterestNodeById, updateInterestNode } from '../services/interestService';
import { CATEGORY_DISPLAY } from '../models/CosmicTypes';

const EditNode = () => {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalNode, setOriginalNode] = useState(null);

  // Load node data on component mount
  useEffect(() => {
    if (nodeId) {
      loadNodeData();
    }
  }, [nodeId]);

  // Load node data from API
  const loadNodeData = async () => {
    try {
      setLoading(true);
      
      const { success, data, error } = await fetchInterestNodeById(nodeId);

      if (success && data) {
        setOriginalNode(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(data.category || 'other');
        setNotes(data.notes || '');
      } else {
        toast.error(error?.message || 'Failed to load node data');
        navigate('/cosmic-discoveries');
      }
    } catch (error) {
      console.error('Error loading node data:', error);
      toast.error('An unexpected error occurred');
      navigate('/cosmic-discoveries');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const nodeData = {
        title: title.trim(),
        description: description.trim(),
        category,
        notes: notes.trim()
      };
      
      const { success, error } = await updateInterestNode(nodeId, nodeData);
      
      if (success) {
        toast.success('Knowledge node updated successfully');
        navigate(`/node/${nodeId}`);
      } else {
        toast.error(error?.message || 'Failed to update node');
      }
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if form has been modified
  const isFormModified = () => {
    if (!originalNode) return false;
    
    return (
      title !== originalNode.title ||
      description !== originalNode.description ||
      category !== originalNode.category ||
      notes !== originalNode.notes
    );
  };

  // Handle cancel
  const handleCancel = () => {
    if (isFormModified()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        navigate(`/node/${nodeId}`);
      }
    } else {
      navigate(`/node/${nodeId}`);
    }
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
          <h2 className="text-xl font-medium text-purple-200">Loading node data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to={`/node/${nodeId}`}
          className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors duration-300"
        >
          <i className="bi bi-arrow-left mr-2"></i>
          <span>Back to Node Details</span>
        </Link>
      </div>

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
          Edit Knowledge Node
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
          Update the details of your knowledge node to refine your cosmic universe.
        </motion.p>
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-900/50 shadow-xl overflow-hidden"
        style={{ boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2)' }}
      >
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-base font-medium text-white mb-2">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                placeholder="Enter a title for your knowledge node"
                required
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-base font-medium text-white mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
              >
                {Object.entries(CATEGORY_DISPLAY).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
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
                rows="5"
                className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                placeholder="Describe this knowledge node in detail"
                required
              ></textarea>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-base font-medium text-white mb-2">
                Personal Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                placeholder="Add any personal notes or thoughts about this node (optional)"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-purple-800/30">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-300 hover:bg-purple-900/30 transition-all duration-300 text-center"
                disabled={submitting}
              >
                <i className="bi bi-x-circle mr-2"></i> Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting || !isFormModified()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-purple-600 hover:to-indigo-600 cursor-pointer text-center relative overflow-hidden group"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 opacity-80"></span>
                <div className="relative z-10">
                  {submitting ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      Updating Node...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle mr-2"></i>
                      Update Node
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditNode;
