import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }
    },
    hover: { 
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };
  
  return (
    <div ref={containerRef} className="bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950 text-white">
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 4 + 1;
            const initialX = Math.random() * 100;
            const initialY = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                initial={{ 
                  x: `${initialX}vw`, 
                  y: `${initialY}vh`, 
                  opacity: Math.random() * 0.5 + 0.1,
                  scale: 0
                }}
                animate={{ 
                  y: [`${initialY}vh`, `${initialY - 20}vh`, `${initialY}vh`],
                  opacity: [0.1, 0.5, 0.1],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: duration, 
                  delay: delay,
                  ease: "easeInOut"
                }}
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                  boxShadow: `0 0 ${size * 2}px ${size / 2}px rgba(255, 255, 255, 0.8)`
                }}
              />
            );
          })}
        </div>
        
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/70 -z-10"></div>
        
        <motion.div 
          className="container mx-auto max-w-6xl z-10 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <motion.div 
            className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-6"
            variants={itemVariants}
          >
            <span className="text-indigo-300">Explore • Connect • Discover</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Cosmic Nexus
            </span>
          </motion.h1>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            {user ? (
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xl font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xl font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Journey
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
          
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth'
                });
              }}
              whileHover={{ y: -5 }}
              animate={{ 
                y: [0, 10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            >
              <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-indigo-400"
              >
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Cosmic Knowledge Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Cosmic <span className="text-indigo-400">Knowledge</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌌",
                title: "Universe",
                description: "Explore the vast universe of cosmic knowledge."
              },
              {
                icon: "🔮",
                title: "Insights",
                description: "Gain deeper insights into the cosmic realm."
              },
              {
                icon: "🌠",
                title: "Journey",
                description: "Embark on a journey through the stars of wisdom."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-indigo-300">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Cosmic Nexus Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-950 to-indigo-950">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Cosmic <span className="text-purple-400">Nexus</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transform -translate-y-1/2 z-0"></div>
            
            {[
              {
                icon: "🌌",
                title: "Explore",
                description: "Journey through a universe of knowledge and discover new connections."
              },
              {
                icon: "✨",
                title: "Connect",
                description: "Link ideas and concepts in ways you never imagined possible."
              },
              {
                icon: "🚀",
                title: "Discover",
                description: "Uncover hidden insights and expand your cosmic understanding."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      

      
      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => {
            const size = Math.random() * 300 + 50;
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-indigo-600/10 blur-3xl"
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                  top: `${top}%`,
                  left: `${left}%`,
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: Math.random() * 10 + 10,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
        
        <div className="container mx-auto max-w-4xl z-10 relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Explore <span className="text-indigo-400">Cosmic Nexus</span>
            </h2>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xl font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-xl font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xl font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="py-8 px-4 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center items-center">
            <div className="text-gray-400">
              © 2025 moah0911 under MIT license
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;