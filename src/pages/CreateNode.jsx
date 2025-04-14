import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { createInterestNode } from '../services/interestService'
import InterestNodeForm from '../components/InterestNodeForm'

const CreateNode = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle node creation
  const handleCreateNode = async (nodeData) => {
    try {
      setIsSubmitting(true)
      
      // Call API to create node
      const { success, data, error, duplicates } = await createInterestNode(nodeData)
      
      if (success) {
        toast.success('Cosmic node created successfully!')
        // Navigate back to the map or dashboard
        navigate('/map')
      } else {
        if (duplicates) {
          toast.error('A node with this title already exists')
        } else {
          toast.error(error?.message || 'Failed to create node')
        }
      }
    } catch (error) {
      console.error('Error creating node:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
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
          Create New Knowledge Node
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
          Add a new star to your cosmic universe of knowledge. Each node represents a topic, concept, or area of interest that you want to explore and connect.
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
          <InterestNodeForm
            onSubmit={handleCreateNode}
            onCancel={() => navigate(-1)}
          />
        </div>
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => navigate(-1)}
          className="text-purple-300 hover:text-purple-200 transition-colors duration-300"
        >
          <i className="bi bi-arrow-left mr-2"></i>
          Return to previous page
        </button>
      </motion.div>
    </div>
  )
}

export default CreateNode
