import { motion } from 'framer-motion'

const AnimatedLoader = ({ message = 'Loading...' }) => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }
  
  const circleVariants = {
    initial: { y: 0 },
    animate: { 
      y: [-15, 0, -15],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  }
  
  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }
  
  const glowVariants = {
    initial: { opacity: 0.3, scale: 1 },
    animate: { 
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  }
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="relative mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary-200 blur-xl"
          variants={glowVariants}
        />
        
        <div className="flex items-center justify-center space-x-3 relative z-10">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-700"
              variants={circleVariants}
              style={{ 
                originY: 0.5,
                boxShadow: "0 4px 10px rgba(79, 70, 229, 0.4)"
              }}
            />
          ))}
        </div>
      </div>
      
      <motion.div
        className="flex flex-col items-center"
        variants={textVariants}
      >
        <h3 className="text-xl font-medium text-primary-700 mb-1">{message}</h3>
        <p className="text-sm text-neutral-500">Please wait a moment...</p>
      </motion.div>
    </motion.div>
  )
}

export default AnimatedLoader