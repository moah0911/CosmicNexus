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
              className="bg-black/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto relative text-purple-200 mx-auto cursor-move"
              style={{
                boxShadow: '0 10px 50px rgba(124, 58, 237, 0.5)',
                WebkitOverflowScrolling: 'touch', // Improve scrolling on iOS
                msOverflowStyle: 'none', // Hide scrollbars in IE/Edge
                scrollbarWidth: 'thin', // Thin scrollbars in Firefox
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.15), transparent 70%)',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: isDragging ? `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))` : 'translate(-50%, -50%)',
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



              <div
                ref={dragHandleRef}
                className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-indigo-800/30 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-md cursor-move rounded-t-2xl"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center mr-3 shadow-md border border-indigo-500/40">
                    <i className="bi bi-stars text-indigo-300 text-xl"></i>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-indigo-100 truncate">{title}</h2>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={onClose}
                    className="text-indigo-300 hover:text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-600/30 transition-all duration-300 transform hover:rotate-90 border border-indigo-500/30"
                    aria-label="Close modal"
                  >
                    <i className="bi bi-x-lg text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 relative z-10 cursor-default">
                {children}
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
