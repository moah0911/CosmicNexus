import { useState } from 'react'
import { toggleFavoritePrompt, deleteDiscoveryPrompt, updateDiscoveryPrompt } from '../services/interestService'
import { toast } from 'react-toastify'
import Modal from './Modal'

const DiscoveryPrompt = ({ prompt, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite || false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editedContent, setEditedContent] = useState(prompt.content || '')

  const handleToggleFavorite = async (e) => {
    e.stopPropagation()
    try {
      const newStatus = !isFavorite
      const { success } = await toggleFavoritePrompt(prompt.id, newStatus)

      if (success) {
        setIsFavorite(newStatus)
        toast.success(newStatus ? 'Added to favorites' : 'Removed from favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleExport = (e) => {
    e.stopPropagation()

    // Create text to export
    const exportText = `
Discovery Prompt from Resonance Map:
-----------------------------------
${prompt.content}

Related Interests: ${prompt.related_nodes ? prompt.related_nodes.join(', ') : 'None'}
Date: ${new Date(prompt.created_at).toLocaleDateString()}
    `.trim()

    // Create a blob and download
    const blob = new Blob([exportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discovery-prompt-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Prompt exported successfully')
  }

  const handleDelete = async (e) => {
    if (e) e.stopPropagation()
    try {
      const { success, error } = await deleteDiscoveryPrompt(prompt.id)

      if (success) {
        // Close the modal first
        setIsDeleteModalOpen(false)
        // Then notify the parent component
        if (onDelete) onDelete(prompt.id)
      } else {
        toast.error(error?.message || 'Failed to delete Cosmic Discovery')
      }
    } catch (error) {
      console.error('Error deleting discovery prompt:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handleEdit = async (e) => {
    if (e) e.stopPropagation()

    if (!editedContent.trim()) {
      toast.error('Content cannot be empty')
      return
    }

    try {
      const { success, error } = await updateDiscoveryPrompt(prompt.id, {
        content: editedContent
      })

      if (success) {
        // Close the modal first
        setIsEditModalOpen(false)
        // Update the local state to reflect the change
        prompt.content = editedContent
        // Show success message
        toast.success('Cosmic Discovery updated successfully')
      } else {
        toast.error(error?.message || 'Failed to update Cosmic Discovery')
      }
    } catch (error) {
      console.error('Error updating discovery prompt:', error)
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <>
      <div
        className="card bg-black/40 hover:shadow-lg transition-all duration-300 border border-indigo-800/30 scale-in"
        style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)' }}
      >
        {/* Favorite indicator */}
        {isFavorite && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-black/60 rounded-full shadow-md flex items-center justify-center z-10 border border-amber-600/50">
            <i className="bi bi-star-fill text-amber-400"></i>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-800 to-purple-800 flex items-center justify-center text-indigo-300 mr-3 shadow-sm relative overflow-hidden"
              style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)' }}>
              <i className="bi bi-stars text-lg relative z-10"></i>
              <div className="absolute inset-0 bg-indigo-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(165, 180, 252, 0.5)'
                }}>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-indigo-300">Cosmic Discovery</h3>
              <div className="flex items-center mt-1">
                <i className="bi bi-calendar-event text-indigo-500 text-xs mr-1.5"></i>
                <span className="text-xs text-indigo-400">
                  {new Date(prompt.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditModalOpen(true)
              }}
              className="text-indigo-400 hover:text-indigo-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-indigo-700/30"
              title="Edit discovery"
            >
              <i className="bi bi-pencil"></i>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteModalOpen(true)
              }}
              className="text-red-400 hover:text-red-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-red-700/30"
              title="Delete discovery"
            >
              <i className="bi bi-trash"></i>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-400 hover:text-indigo-300 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 border border-indigo-700/30"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
          </div>
        </div>

        <div
          className={`transition-all duration-500 ${isExpanded ? 'max-h-[500px]' : 'max-h-32'} overflow-hidden cursor-pointer`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="bg-black/60 p-5 rounded-xl shadow-sm border border-indigo-800/30">
            <p className="text-indigo-300 mb-4 font-serif italic leading-relaxed text-lg">
              "{prompt.content}"
            </p>

            {prompt.related_nodes && prompt.related_nodes.length > 0 && (
              <div className={`mt-4 pt-4 border-t border-indigo-800/30 ${isExpanded ? 'fade-in' : 'opacity-0'}`}>
                <h4 className="text-sm font-medium text-indigo-400 mb-2 flex items-center">
                  <i className="bi bi-diagram-3 mr-2"></i>
                  <span>Related Knowledge Nodes:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prompt.related_nodes.map((node, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1.5 text-sm font-medium rounded-full bg-black/40 text-indigo-300 shadow-sm border border-indigo-700/30"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-indigo-800/30">
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center px-3 py-1.5 rounded-full shadow-sm transition-all duration-200 ${
              isFavorite
                ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-800/50 border border-amber-700/50'
                : 'bg-black/60 text-indigo-400 hover:text-amber-300 hover:bg-amber-900/20 border border-indigo-700/30'
            }`}
          >
            <i className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'} mr-2`}></i>
            <span className="text-sm font-medium">{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center px-3 py-1.5 rounded-full bg-black/60 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 shadow-sm transition-all duration-200 border border-indigo-700/30"
          >
            <i className="bi bi-download mr-2"></i>
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Cosmic Discovery"
      >
        <div>
          <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl shadow-sm border border-purple-600/30 mb-6"
            style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.15)' }}>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center mr-3 relative overflow-hidden shadow-md"
                style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)' }}>
                <i className="bi bi-stars text-purple-200 relative z-10"></i>
                <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                  style={{
                    animationDuration: '3s',
                    boxShadow: 'inset 0 0 20px rgba(216, 180, 254, 0.5)'
                  }}>
                </div>
              </div>
              <h3 className="font-bold text-purple-300 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">Refine Your Cosmic Discovery</h3>
            </div>
            <p className="text-purple-300 text-sm leading-relaxed">
              Edit your cosmic discovery to refine its insights. These discoveries help you explore new dimensions of your knowledge universe.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-purple-300 mb-2 flex items-center">
              <i className="bi bi-pencil-square mr-2"></i>
              <span>Discovery Content</span>
            </label>
            <textarea
              id="content"
              rows={6}
              className="w-full px-4 py-3 border border-purple-600/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 font-serif bg-black/60 text-purple-300 shadow-inner"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Enter the content of your cosmic discovery..."
              style={{ boxShadow: 'inset 0 2px 10px rgba(147, 51, 234, 0.1)' }}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-purple-600/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300"
            >
              <i className="bi bi-x-circle mr-2"></i> Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] hover:from-purple-700 hover:to-indigo-700"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)' }}
            >
              <i className="bi bi-check-circle mr-2"></i> Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Cosmic Discovery"
      >
        <div>
          <div className="p-4 bg-black/40 rounded-xl shadow-sm border border-red-800/30 mb-6"
            style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.1)' }}>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center mr-3 relative overflow-hidden"
                style={{ boxShadow: '0 0 10px rgba(220, 38, 38, 0.3)' }}>
                <i className="bi bi-exclamation-triangle text-red-300 relative z-10"></i>
                <div className="absolute inset-0 bg-red-500 opacity-0 animate-pulse"
                  style={{
                    animationDuration: '3s',
                    boxShadow: 'inset 0 0 20px rgba(248, 113, 113, 0.5)'
                  }}>
                </div>
              </div>
              <h3 className="font-bold text-red-300">Confirm Deletion</h3>
            </div>
            <p className="text-red-400 text-sm leading-relaxed">
              Are you sure you want to delete this Cosmic Discovery? This action cannot be undone and the discovery will be permanently removed from your collection.
            </p>
          </div>

          <div className="bg-black/60 p-5 rounded-xl shadow-sm border border-indigo-800/30 mb-6">
            <p className="text-indigo-300 font-serif italic leading-relaxed">"{prompt.content}"</p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-3 rounded-xl border border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 transition-all duration-300"
            >
              <i className="bi bi-arrow-left mr-2"></i> Keep Discovery
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700"
              style={{ boxShadow: '0 0 15px rgba(220, 38, 38, 0.3)' }}
            >
              <i className="bi bi-trash mr-2"></i> Delete Forever
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default DiscoveryPrompt
