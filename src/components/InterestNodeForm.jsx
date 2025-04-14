import { useState, useEffect, useCallback } from 'react'

const InterestNodeForm = ({ node, onSubmit, onCancel }) => {
  // Initialize with default values
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    description: '',
    notes: ''
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Define categories
  const categories = [
    { value: 'art', label: 'Art & Design', icon: 'bi-palette', color: 'bg-rose-500', gradient: 'from-rose-500 to-pink-500' },
    { value: 'science', label: 'Science', icon: 'bi-atom', color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500' },
    { value: 'history', label: 'History', icon: 'bi-hourglass-split', color: 'bg-amber-500', gradient: 'from-amber-500 to-yellow-500' },
    { value: 'music', label: 'Music', icon: 'bi-music-note-beamed', color: 'bg-purple-500', gradient: 'from-purple-500 to-indigo-500' },
    { value: 'literature', label: 'Literature', icon: 'bi-book', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-500' },
    { value: 'philosophy', label: 'Philosophy', icon: 'bi-lightbulb', color: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-500' },
    { value: 'technology', label: 'Technology', icon: 'bi-cpu', color: 'bg-cyan-500', gradient: 'from-cyan-500 to-blue-500' },
    { value: 'hobby', label: 'Hobby', icon: 'bi-controller', color: 'bg-pink-500', gradient: 'from-pink-500 to-rose-500' },
    { value: 'general', label: 'General', icon: 'bi-tag', color: 'bg-gray-500', gradient: 'from-gray-500 to-slate-500' }
  ]

  // Reset form when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        title: node.title || '',
        category: node.category || 'general',
        description: node.description || '',
        notes: node.notes || ''
      })
      // Clear any previous errors
      setFormErrors({})
    } else {
      // Reset to defaults for new node
      setFormData({
        title: '',
        category: 'general',
        description: '',
        notes: ''
      })
      setFormErrors({})
    }
  }, [node])

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }, [formErrors])

  // Handle category selection
  const handleCategorySelect = useCallback((categoryValue) => {
    setFormData(prev => ({ ...prev, category: categoryValue }))
  }, [])

  // Validate form fields
  const validateForm = useCallback(() => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    } else if (formData.title.length > 50) {
      errors.title = "Title must be less than 50 characters"
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare clean data for submission
      const cleanData = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        notes: formData.notes.trim()
      }

      await onSubmit(cleanData)
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  // Helper functions for category styling
  const getCategoryColor = useCallback((categoryValue) => {
    const category = categories.find(c => c.value === categoryValue)
    return category ? category.color : 'bg-gray-500'
  }, [categories])

  const getCategoryGradient = useCallback((categoryValue) => {
    const category = categories.find(c => c.value === categoryValue)
    return category ? category.gradient : 'from-gray-500 to-slate-500'
  }, [categories])

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 p-6 rounded-2xl shadow-inner"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white">
          {node ? 'Update Cosmic Node' : 'Create New Cosmic Node'}
        </h3>
        <p className="text-purple-200 mt-2">
          {node ? 'Refine your cosmic knowledge node' : 'Add a new star to your cosmic universe'}
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-base font-medium text-white mb-2">
          Node Title <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            autoComplete="off"
            className={`w-full px-5 py-3 pl-12 rounded-xl border-2 ${formErrors.title ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-purple-500 focus:border-purple-400 focus:ring-purple-400'} bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300`}
            placeholder="e.g., Quantum Physics, Renaissance Art, Jazz Music"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <i className="bi bi-stars text-white text-sm"></i>
          </div>
        </div>
        {formErrors.title && (
          <p className="mt-2 text-sm text-rose-500 flex items-center">
            <i className="bi bi-exclamation-circle mr-1"></i> {formErrors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-base font-medium text-white mb-2">
          Knowledge Category
        </label>
        <div className="grid grid-cols-3 gap-3 mb-2">
          {categories.map(category => (
            <div
              key={category.value}
              onClick={() => handleCategorySelect(category.value)}
              className={`flex flex-col items-center p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                formData.category === category.value
                  ? 'border-purple-400 bg-black/80 shadow-md scale-105'
                  : 'border-purple-700 hover:border-purple-500 hover:bg-black/60'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br ${
                formData.category === category.value
                  ? category.gradient
                  : 'from-gray-700 to-gray-800'
              } shadow-md`}>
                <i className={`bi ${category.icon} ${formData.category === category.value ? 'text-white' : 'text-gray-300'} text-lg`}></i>
              </div>
              <span className={`text-sm font-medium ${formData.category === category.value ? 'text-purple-300' : 'text-neutral-300'}`}>
                {category.label}
              </span>
            </div>
          ))}
        </div>
        {/* Hidden select for form submission */}
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-base font-medium text-white mb-2">
          Description <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full px-5 py-3 pl-12 rounded-xl border-2 ${formErrors.description ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-purple-500 focus:border-purple-400 focus:ring-purple-400'} bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300`}
            placeholder="Describe this cosmic node in detail..."
          ></textarea>
          <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <i className="bi bi-card-text text-white text-sm"></i>
          </div>
        </div>
        {formErrors.description && (
          <p className="mt-2 text-sm text-rose-500 flex items-center">
            <i className="bi bi-exclamation-circle mr-1"></i> {formErrors.description}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-base font-medium text-white mb-2">
          Personal Notes <span className="text-neutral-300 text-sm">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className="w-full px-5 py-3 pl-12 rounded-xl border-2 border-purple-500 focus:border-purple-400 focus:ring-purple-400 bg-black/60 text-white backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-300"
            placeholder="Add your personal thoughts or context..."
          ></textarea>
          <div className="absolute left-3 top-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <i className="bi bi-journal-text text-white text-sm"></i>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border-2 border-purple-600 text-purple-300 hover:bg-purple-900/30 transition-all duration-300"
          disabled={isSubmitting}
        >
          <i className="bi bi-x-circle mr-2"></i> Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
              {node ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <i className={`bi ${node ? 'bi-check-circle' : 'bi-plus-circle'} mr-2`}></i>
              {node ? 'Update Node' : 'Create Node'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default InterestNodeForm
