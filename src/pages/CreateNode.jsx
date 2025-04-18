import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { createInterestNode } from '../services/interestService';
import { CATEGORY_DISPLAY } from '../models/CosmicTypes';

const CreateNode = () => {
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      
      const { success, data, error } = await createInterestNode(nodeData);
      
      if (success) {
        toast.success('Knowledge node created successfully');
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

  return (
    <div className="max-w-4xl mx-auto">
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
          Create Knowledge Node
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
          Add a new knowledge node to your cosmic universe. Knowledge nodes represent ideas, concepts, or areas of interest that you want to explore and connect.
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
              <p className="mt-2 text-purple-400 text-sm">
                Choose a clear, concise title that represents this concept or idea.
              </p>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-base font-medium text-white mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {Object.entries(CATEGORY_DISPLAY).map(([key, { name, icon }]) => (
                  <div
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center ${
                      category === key
                        ? 'bg-purple-900/40 border-2 border-purple-600/70'
                        : 'bg-black/60 border border-purple-800/30 hover:border-purple-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 ${
                      category === key
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                        : 'bg-gradient-to-br from-purple-800 to-indigo-800'
                    }`}>
                      <i className={`bi ${icon} text-lg`}></i>
                    </div>
                    <span className="text-sm text-center text-purple-200">{name}</span>
                  </div>
                ))}
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
                rows="5"
                className="w-full px-5 py-3 rounded-xl border-2 border-purple-700 focus:border-purple-500 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
                placeholder="Describe this knowledge node in detail"
                required
              ></textarea>
              <p className="mt-2 text-purple-400 text-sm">
                Provide a detailed description of this concept, idea, or area of interest.
              </p>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-purple-300 hover:text-purple-200 transition-colors duration-300"
              >
                <i className={`bi ${showAdvanced ? 'bi-chevron-down' : 'bi-chevron-right'} mr-2`}></i>
                <span>Advanced Options</span>
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="mb-6 bg-black/60 p-5 rounded-xl border border-purple-800/30">
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
                  <p className="mt-2 text-purple-400 text-sm">
                    These notes are for your personal reference and won't be used for generating insights.
                  </p>
                </div>
              </div>
            )}

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
                disabled={submitting || !title.trim() || !description.trim()}
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
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 bg-black/40 backdrop-blur-md rounded-xl border border-purple-900/50 p-5 shadow-lg"
        style={{ boxShadow: '0 10px 40px rgba(124, 58, 237, 0.1)' }}
      >
        <h2 className="text-lg font-bold text-purple-200 mb-3">Tips for Creating Effective Nodes</h2>
        <ul className="space-y-2 text-purple-300 text-sm">
          <li className="flex items-start">
            <i className="bi bi-check-circle text-purple-400 mr-2 mt-1"></i>
            <span>Be specific and focused in your node titles and descriptions</span>
          </li>
          <li className="flex items-start">
            <i className="bi bi-check-circle text-purple-400 mr-2 mt-1"></i>
            <span>Include key concepts, ideas, and relevant details in your descriptions</span>
          </li>
          <li className="flex items-start">
            <i className="bi bi-check-circle text-purple-400 mr-2 mt-1"></i>
            <span>Choose the most appropriate category to help organize your knowledge universe</span>
          </li>
          <li className="flex items-start">
            <i className="bi bi-check-circle text-purple-400 mr-2 mt-1"></i>
            <span>After creating nodes, connect them to discover relationships and generate insights</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default CreateNode;
