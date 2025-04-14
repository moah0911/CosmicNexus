import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable } from '../hooks/useDraggable'

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null)
  const dragHandleRef = useRef(null)
  const [isRendered, setIsRendered] = useState(false)

  // Initialize draggable functionality with improved options
  const { position, isDragging, reset: resetPosition } = useDraggable(dragHandleRef, {
    bounds: true, // Keep within viewport
    onDragStart: () => {
      // Add a class to indicate dragging state
      if (modalRef.current) {
        modalRef.current.classList.add('dragging')
      }
    },
    onDragEnd: () => {
      // Remove dragging class
      if (modalRef.current) {
        modalRef.current.classList.remove('dragging')
      }
    }
  })

  // Ensure modal is properly initialized and centered
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      // Reset position when modal opens to ensure it's centered
      resetPosition()
    }
  }, [isOpen, resetPosition])

  // Handle keyboard events
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Add escape key listener when modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Handle click on the backdrop (outside the modal)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // If modal is not open and has never been rendered, return null
  if (!isOpen && !isRendered) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%)'
            }}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            className="absolute bg-black/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden text-purple-200 cursor-move"
            style={{
              boxShadow: '0 10px 50px rgba(124, 58, 237, 0.5)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.15), transparent 70%)',
              width: 'min(90vw, 600px)',
              maxHeight: '90vh',
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: isDragging ? 'scale(1.02)' : 'scale(1)',
              transition: isDragging ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out, left 0.3s ease-out, top 0.3s ease-out',
              zIndex: 100
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-3 -left-3 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 z-0"></div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>

            {/* Header - Drag Handle */}
            <div
              ref={dragHandleRef}
              className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-indigo-800/30 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-md cursor-move rounded-t-2xl group"
            >
              {/* Drag indicator */}
              <div className="absolute top-0 left-0 right-0 flex justify-center">
                <div className="w-10 h-1 bg-indigo-500/30 rounded-full mt-2 group-hover:bg-indigo-500/50 transition-colors duration-300"></div>
              </div>
              <div className="flex items-center overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center mr-3 shadow-md border border-indigo-500/40">
                  <i className="bi bi-stars text-indigo-300 text-xl"></i>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-indigo-100 truncate">{title}</h2>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="text-indigo-300 hover:text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-600/30 transition-all duration-300 transform hover:rotate-90 border border-indigo-500/30"
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 relative z-10 cursor-default overflow-y-auto modal-scrollbar" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
