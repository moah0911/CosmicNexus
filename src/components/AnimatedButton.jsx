import { motion } from 'framer-motion'
import { useState } from 'react'

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  icon = null,
  disabled = false,
  type = 'button'
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Define button styles based on variant
  const getButtonStyles = () => {
    const baseStyles = 'relative overflow-hidden rounded-lg px-4 py-2 font-medium transition-all duration-300 flex items-center justify-center'
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg`
      case 'secondary':
        return `${baseStyles} bg-secondary-600 text-white hover:bg-secondary-700 shadow-md hover:shadow-lg`
      case 'outline':
        return `${baseStyles} border border-primary-600 text-primary-600 hover:bg-primary-50`
      case 'ghost':
        return `${baseStyles} text-primary-600 hover:bg-primary-50`
      case 'danger':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg`
      default:
        return `${baseStyles} bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg`
    }
  }
  
  // Animation variants
  const buttonVariants = {
    initial: {},
    hover: {},
    tap: { scale: 0.98 }
  }
  
  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: { 
      opacity: 0.15, 
      scale: 1.5,
      transition: { duration: 0.3 }
    }
  }
  
  const iconVariants = {
    initial: { x: 0 },
    hover: { 
      x: [0, 5, 0], 
      transition: { 
        repeat: Infinity, 
        repeatType: "mirror", 
        duration: 1 
      }
    }
  }
  
  const rippleVariants = {
    initial: { 
      opacity: 0,
      scale: 0.2,
    },
    animate: { 
      opacity: [0.7, 0],
      scale: 2,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }
  
  const [ripples, setRipples] = useState([])
  
  const handleClick = (e) => {
    if (disabled) return
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const id = Date.now()
    setRipples([...ripples, { id, x, y }])
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(ripples => ripples.filter(ripple => ripple.id !== id))
    }, 800)
    
    if (onClick) onClick(e)
  }
  
  return (
    <motion.button
      type={type}
      className={`${getButtonStyles()} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap={disabled ? {} : "tap"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      disabled={disabled}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        variants={glowVariants}
        style={{
          background: variant === 'primary' || variant === 'secondary' || variant === 'danger'
            ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)'
            : 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, rgba(79,70,229,0) 70%)'
        }}
      />
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10
          }}
          variants={rippleVariants}
          initial="initial"
          animate="animate"
        />
      ))}
      
      {/* Icon */}
      {icon && (
        <motion.span 
          className="mr-2"
          variants={iconVariants}
        >
          {icon}
        </motion.span>
      )}
      
      {/* Button text */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export default AnimatedButton