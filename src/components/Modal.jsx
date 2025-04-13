import { useEffect, useRef } from 'react'

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null)
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-purple-200 animate-scaleIn"
        style={{ 
          boxShadow: '0 0 30px rgba(147, 51, 234, 0.2)',
          position: 'relative',
          top: '0',
          transform: 'none'
        }}
      >
        <div className="flex justify-between items-center p-5 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">{title}</h2>
          <button 
            onClick={onClose}
            className="text-purple-500 hover:text-purple-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-purple-100 transition-all duration-300"
            aria-label="Close modal"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
