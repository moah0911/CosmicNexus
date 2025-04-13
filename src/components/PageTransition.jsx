
import { motion } from 'framer-motion'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full min-h-[60vh] bg-transparent"
      style={{ 
        willChange: 'opacity, transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition