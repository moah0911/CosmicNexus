import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null)
  const [isRendered, setIsRendered] = useState(false)

  // Ensure modal is properly initialized
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
    }
  }, [isOpen])

  // Store scroll position when modal opens
  const scrollY = useRef(0)

  // Handle keyboard events and body scroll
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

      // Use a simpler approach - just prevent scrolling on the body
      // This is more stable and less likely to cause visual glitches
      document.body.classList.add('overflow-hidden')

      // Add escape key listener
      document.addEventListener('keydown', handleEscape)

      return () => {
        // Remove the overflow-hidden class when modal closes
        document.body.classList.remove('overflow-hidden')

        // Restore scroll position after a short delay to prevent visual glitches
        setTimeout(() => {
          window.scrollTo(0, scrollY.current)
        }, 0)

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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
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
            <motion.div
              className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
            >
            <motion.div
              ref={modalRef}
              className="bg-black/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative my-10 text-purple-200"
              style={{
                boxShadow: '0 10px 50px rgba(124, 58, 237, 0.5)',
                WebkitOverflowScrolling: 'touch', // Improve scrolling on iOS
                msOverflowStyle: 'none', // Hide scrollbars in IE/Edge
                scrollbarWidth: 'thin', // Thin scrollbars in Firefox
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.1), transparent 70%)'
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

              <div className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-purple-800/30 bg-black/95 backdrop-blur-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center mr-3 shadow-md border border-purple-700/30">
                    <i className="bi bi-stars text-purple-400"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-200">{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-purple-400 hover:text-purple-300 w-10 h-10 rounded-full flex items-center justify-center hover:bg-purple-900/30 transition-all duration-300 transform hover:rotate-90"
                  aria-label="Close modal"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <div className="p-6 relative z-10">
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
