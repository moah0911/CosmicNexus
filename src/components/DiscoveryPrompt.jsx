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
      const { success, data, error } = await updateDiscoveryPrompt(prompt.id, {
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
        className="card bg-gradient-to-br from-secondary-50 to-primary-50 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-2">
              <i className="bi bi-lightbulb"></i>
            </div>
            <h3 className="font-medium text-neutral-900">Cosmic Discovery</h3>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsEditModalOpen(true)
              }}
              className="text-neutral-500 hover:text-primary-600 bg-white rounded-md px-2 py-1 flex items-center justify-center shadow-sm mr-2"
              title="Edit"
            >
              <i className="bi bi-pencil text-xs mr-1"></i>
              <span className="text-xs">Edit</span>
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteModalOpen(true)
              }}
              className="text-neutral-500 hover:text-red-600 bg-white rounded-md px-2 py-1 flex items-center justify-center shadow-sm mr-2"
              title="Delete"
            >
              <i className="bi bi-trash text-xs mr-1"></i>
              <span className="text-xs">Delete</span>
            </button>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-neutral-500 hover:text-primary-600 bg-white rounded-md px-2 py-1 flex items-center justify-center shadow-sm"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-xs mr-1`}></i>
              <span className="text-xs">{isExpanded ? "Collapse" : "Expand"}</span>
            </button>
          </div>
        </div>
        
        <div 
          className={`transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-32'} overflow-hidden cursor-pointer`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className="text-neutral-700 mb-4 font-serif italic">
            "{prompt.content}"
          </p>
          
          {prompt.related_nodes && prompt.related_nodes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-neutral-600 mb-2">Related Interests:</h4>
              <div className="flex flex-wrap gap-2">
                {prompt.related_nodes.map((node, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-white bg-opacity-70 text-neutral-700 shadow-sm"
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200 border-opacity-50">
          <div className="flex items-center space-x-1">
            <i className="bi bi-calendar-event text-neutral-500 text-sm"></i>
            <span className="text-xs text-neutral-500">
              {new Date(prompt.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleToggleFavorite}
              className={`text-sm flex items-center px-2 py-1 rounded-md ${isFavorite ? 'text-amber-600 bg-amber-50' : 'text-neutral-500 hover:text-amber-600'}`}
            >
              <i className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'} mr-1`}></i>
              <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
            <button 
              onClick={handleExport}
              className="text-neutral-500 hover:text-primary-600 text-sm flex items-center px-2 py-1 rounded-md hover:bg-white hover:bg-opacity-50"
            >
              <i className="bi bi-download mr-1"></i>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Cosmic Discovery"
      >
        <div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              rows={5}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Enter the content of your cosmic discovery..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="btn-primary"
            >
              Save Changes
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
          <p className="text-neutral-700 mb-4">
            Are you sure you want to delete this Cosmic Discovery? This action cannot be undone.
          </p>
          
          <div className="bg-neutral-50 p-3 rounded-md mb-4">
            <p className="text-neutral-700 font-serif italic">"{prompt.content}"</p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default DiscoveryPrompt
