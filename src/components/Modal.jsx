import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable } from '../hooks/useDraggable'

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null)
  const dragHandleRef = useRef(null)
  const [isRendered, setIsRendered] = useState(false)
  const [isDraggable, setIsDraggable] = useState(true) // Always draggable by default

  // Initialize draggable functionality
  const { position, isDragging } = useDraggable(dragHandleRef, {
    disabled: !isDraggable,
    bounds: { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }
  })

  // Ensure modal is properly initialized
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
    }
  }, [isOpen])

  // Store scroll position when modal opens
  const scrollY = useRef(0)

  // Handle keyboard events without preventing body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Add escape key listener when modal is open
    if (isOpen) {
      // Store the current scroll position
      scrollY.current = window.scrollY

      // We're NOT adding overflow-hidden to body anymore to allow background scrolling
      // Instead, we'll make the modal itself scrollable

      // Add escape key listener
      document.addEventListener('keydown', handleEscape)

      return () => {
        // Remove event listener
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  // Handle click on the backdrop (outside the modal)
  const handleBackdropClick = (e) => {
    // Only close if the actual backdrop was clicked (not its children)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Stop propagation of clicks inside the modal to prevent closing
  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  // If modal is not open and has never been rendered, return null
  if (!isOpen && !isRendered) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 py-4 sm:py-12 pointer-events-none">
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
              onClick={handleBackdropClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%)'
              }}
            />
            <motion.div
              className="w-full max-w-xl md:max-w-2xl text-left pointer-events-auto relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
            <motion.div
              ref={modalRef}
              className="bg-black/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl max-h-[80vh] overflow-y-auto relative text-purple-200 mx-auto cursor-move"
              style={{
                boxShadow: isDragging
                  ? '0 15px 60px rgba(124, 58, 237, 0.7)'
                  : '0 10px 50px rgba(124, 58, 237, 0.5)',
                WebkitOverflowScrolling: 'touch', // Improve scrolling on iOS
                msOverflowStyle: 'none', // Hide scrollbars in IE/Edge
                scrollbarWidth: 'thin', // Thin scrollbars in Firefox
                border: isDragging
                  ? '2px solid rgba(139, 92, 246, 0.6)'
                  : '1px solid rgba(139, 92, 246, 0.3)',
                backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.1), transparent 70%)',
                transform: isDragging ? `translate(${position.x}px, ${position.y}px)` : undefined,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out, box-shadow 0.3s ease, border 0.3s ease'
              }}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                duration: 0.3
              }}
              onClick={handleModalClick}
            >
              {/* Decorative elements */}
              <div className="absolute -top-3 -left-3 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 z-0"></div>
              <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>

              {/* Draggable indicator */}
              <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-900/80 text-purple-200 text-xs px-3 py-1 rounded-full border border-purple-700/50 z-20 flex items-center space-x-1 ${isDragging ? 'opacity-100' : 'opacity-70'} ${!isDragging ? 'animate-bounce-subtle' : ''}`}>
                <i className="bi bi-arrows-move"></i>
                <span>{isDragging ? 'Moving...' : 'Draggable'}</span>
              </div>

              <div
                ref={dragHandleRef}
                className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-purple-800/30 bg-black/95 backdrop-blur-md cursor-move"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center mr-3 shadow-md border border-purple-700/30">
                    <i className="bi bi-stars text-purple-400"></i>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-purple-200 truncate">{title}</h2>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded-md border border-purple-700/30 animate-pulse">
                    <i className="bi bi-arrows-move mr-1"></i> Drag to Move
                  </div>
                  <button
                    onClick={onClose}
                    className="text-purple-400 hover:text-purple-300 w-10 h-10 rounded-full flex items-center justify-center hover:bg-purple-900/30 transition-all duration-300 transform hover:rotate-90"
                    aria-label="Close modal"
                  >
                    <i className="bi bi-x-lg text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 relative z-10 cursor-default">
                {children}
              </div>

              {/* Modal controls */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                <div className="flex items-center space-x-2 bg-black/60 px-3 py-1 rounded-full border border-purple-700/30">
                  <div className="flex items-center text-xs text-purple-400">
                    <i className="bi bi-grip-horizontal mr-1"></i>
                    <span className="hidden sm:inline-block">Drag to move</span>
                  </div>
                </div>
              </div>
            </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
