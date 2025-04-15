import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import PromptTemplate from '../components/PromptTemplate'

const PromptTemplates = () => {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState(null)

  const handleGenerateWithTemplate = (templateId) => {
    setIsGenerating(true)
    setActiveTemplate(templateId)

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false)
      setActiveTemplate(null)
      toast.success('Prompt generated successfully!')
      navigate('/insights')
    }, 2000)
  }

  const templates = [
    {
      id: 'connections',
      title: 'Knowledge Connections',
      description: 'Generate insights by connecting different knowledge nodes in your cosmic universe.',
      icon: 'bi-diagram-3',
      action: () => navigate('/generate-insights')
    },
    {
      id: 'exploration',
      title: 'Cosmic Exploration',
      description: 'Explore new territories and undiscovered dimensions in your knowledge universe.',
      icon: 'bi-compass',
      action: () => handleGenerateWithTemplate('exploration')
    },
    {
      id: 'reflection',
      title: 'Cosmic Reflection',
      description: 'Reflect on your existing knowledge and discover deeper meanings and patterns.',
      icon: 'bi-lightbulb',
      action: () => handleGenerateWithTemplate('reflection')
    },
    {
      id: 'challenge',
      title: 'Cosmic Challenge',
      description: 'Challenge your existing knowledge and perspectives with thought-provoking questions.',
      icon: 'bi-question-circle',
      action: () => handleGenerateWithTemplate('challenge')
    }
  ]

  return (
    <div className="max-w-5xl mx-auto">
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
          Cosmic Prompt Templates
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
          Choose a template to generate AI-powered insights and explore new dimensions in your cosmic knowledge universe.
        </motion.p>
      </div>

      {/* Templates Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {templates.map((template) => (
          <PromptTemplate
            key={template.id}
            title={template.title}
            description={template.description}
            icon={template.icon}
            onGenerate={template.action}
            isLoading={isGenerating && activeTemplate === template.id}
          />
        ))}
      </motion.div>

      {/* Back Button */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl border border-purple-700/50 text-purple-300 hover:bg-purple-900/30 transition-all duration-300"
        >
          <i className="bi bi-arrow-left mr-2"></i> Back to Insights
        </button>
      </motion.div>
    </div>
  )
}

export default PromptTemplates