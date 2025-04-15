import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform for parallax effects
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 100]);

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
          className="container mx-auto max-w-6xl z-10 text-center relative"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Animated cosmic elements */}
          <div className="absolute top-0 left-0 right-0 -z-1 overflow-hidden h-full">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`orbit-${i}`}
                className="absolute rounded-full border border-indigo-500/20"
                style={{
                  width: `${300 + i * 200}px`,
                  height: `${300 + i * 200}px`,
                  top: '50%',
                  left: '50%',
                  marginLeft: `-${(300 + i * 200) / 2}px`,
                  marginTop: `-${(300 + i * 200) / 2}px`,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 30 + i * 10,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                <motion.div
                  className="absolute w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: 0,
                  }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-base font-medium mb-8 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
            variants={itemVariants}
          >
            <span className="text-indigo-300 flex items-center">
              <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              Map Your Knowledge • Connect Ideas • Discover Insights
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-8"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
              Cosmic Knowledge Nexus
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-purple-200/80 max-w-3xl mx-auto mb-10"
            variants={itemVariants}
          >
            Your personal universe of ideas, connections, and discoveries awaits.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            variants={itemVariants}
          >
            {user ? (
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-full text-xl font-medium shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 hover:translate-y-[-5px]"
              >
                <span className="flex items-center justify-center">
                  <i className="bi bi-grid-1x2 mr-2"></i>
                  Go to Dashboard
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-full text-xl font-medium shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 hover:translate-y-[-5px]"
                >
                  <span className="flex items-center justify-center">
                    <i className="bi bi-rocket-takeoff mr-2"></i>
                    Start Your Journey
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xl font-medium hover:bg-white/20 transition-all duration-300 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/20"
                >
                  <span className="flex items-center justify-center">
                    <i className="bi bi-box-arrow-in-right mr-2"></i>
                    Sign In
                  </span>
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

      {/* What is Cosmic Knowledge Nexus Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background elements with parallax effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/0 via-purple-900/10 to-black/0"></div>
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full filter blur-3xl"
            style={{ y: parallaxY }}
          ></motion.div>
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-900/20 rounded-full filter blur-3xl"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
          ></motion.div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-1 bg-indigo-900/30 rounded-full text-sm font-medium mb-4 border border-indigo-500/30">
              <span className="text-indigo-300">EXPLORE THE COSMOS OF YOUR MIND</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">Cosmic Knowledge Nexus</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6">
              A revolutionary personal knowledge management system that transforms how you visualize, connect, and discover relationships between your ideas and interests.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: "bi-diagram-3",
                color: "from-indigo-500 to-blue-500",
                title: "Knowledge Graph",
                description: "Create a visual map of your knowledge with interconnected nodes representing your ideas, concepts, and interests. Organize your thoughts in a cosmic universe that grows with you."
              },
              {
                icon: "bi-link-45deg",
                color: "from-purple-500 to-indigo-500",
                title: "Meaningful Connections",
                description: "Establish different types of relationships between your knowledge nodes to reflect how ideas influence, contrast with, or build upon each other. Discover how everything is connected."
              },
              {
                icon: "bi-lightbulb",
                color: "from-fuchsia-500 to-purple-500",
                title: "Insight Discovery",
                description: "Uncover hidden patterns and generate AI-powered insights by exploring the connections between your knowledge nodes. Transform your understanding through new perspectives."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative group hover:border-indigo-500/30 transition-all duration-500"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover={{ y: -10, boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.3)' }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                    <i className={`bi ${feature.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <a href="#how-to-use" className="text-indigo-400 hover:text-indigo-300 flex items-center text-sm font-medium group">
                      Learn how to use
                      <i className="bi bi-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <a href="#why-use" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-900/30 rounded-full text-indigo-300 hover:bg-indigo-900/50 transition-all duration-300">
              <span>Discover the benefits</span>
              <i className="bi bi-chevron-down ml-2"></i>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Why Use Cosmic Knowledge Nexus Section */}
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
              Why Use <span className="text-purple-400">Cosmic Knowledge Nexus</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6">
              Transform how you organize and connect your knowledge with these powerful benefits:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transform -translate-y-1/2 z-0"></div>

            {[
              {
                icon: "🧩",
                title: "Connect Disparate Ideas",
                description: "Break down silos between different domains of knowledge and discover unexpected connections between seemingly unrelated topics."
              },
              {
                icon: "🔍",
                title: "Visualize Your Thinking",
                description: "See the big picture of your knowledge landscape and identify patterns, gaps, and opportunities for new connections."
              },
              {
                icon: "✨",
                title: "Spark Creative Insights",
                description: "Generate new ideas and perspectives by exploring the relationships between your knowledge nodes."
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
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* How to Use Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-indigo-950 to-purple-950">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How to <span className="text-indigo-400">Use It</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6">
              Getting started with Cosmic Knowledge Nexus is simple and intuitive:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
            <motion.div
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative z-10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold mr-4">1</div>
                <h3 className="text-2xl font-bold text-white">Create Cosmic Nodes</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Start by creating knowledge nodes for your ideas, concepts, or topics of interest. Each node represents a piece of knowledge in your personal universe.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Give your node a descriptive title</li>
                <li>Add detailed descriptions to capture your understanding</li>
                <li>Categorize nodes by knowledge domain (Science, Art, Philosophy, etc.)</li>
                <li>Add personal notes for context or future reference</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative z-10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold mr-4">2</div>
                <h3 className="text-2xl font-bold text-white">Establish Connections</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Create meaningful relationships between your knowledge nodes to reflect how ideas relate to each other.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><span className="text-purple-300 font-medium">Related:</span> Simple association between nodes</li>
                <li><span className="text-purple-300 font-medium">Influences:</span> One node impacts or shapes another</li>
                <li><span className="text-purple-300 font-medium">Inspires:</span> Creative inspiration between nodes</li>
                <li><span className="text-purple-300 font-medium">Contrasts:</span> Nodes that oppose or differ from each other</li>
                <li><span className="text-purple-300 font-medium">Builds On:</span> Nodes that extend or develop other ideas</li>
                <li><span className="text-purple-300 font-medium">Complements:</span> Nodes that enhance or complete each other</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative z-10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold mr-4">3</div>
                <h3 className="text-2xl font-bold text-white">Explore Your Cosmic Map</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Navigate through your knowledge universe using the interactive cosmic map visualization.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>View your entire knowledge network at once</li>
                <li>Zoom in on specific clusters of related nodes</li>
                <li>Drag and rearrange nodes to better understand relationships</li>
                <li>Filter nodes by category or connection type</li>
                <li>Search for specific nodes or connections</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative z-10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold mr-4">4</div>
                <h3 className="text-2xl font-bold text-white">Generate Insights</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Discover new perspectives and connections you might not have considered before.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Identify patterns across different knowledge domains</li>
                <li>Discover unexpected connections between your ideas</li>
                <li>Generate new insights based on your existing knowledge network</li>
                <li>Find gaps in your knowledge that could be filled with new nodes</li>
                <li>Use insights to spark creativity and deeper understanding</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-950/20 via-indigo-950/20 to-black/0"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-900/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-purple-900/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-1 bg-indigo-900/30 rounded-full text-sm font-medium mb-4 border border-indigo-500/30">
              <span className="text-indigo-300">QUESTIONS & ANSWERS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">Questions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6">
              Everything you need to know about Cosmic Knowledge Nexus
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "Is Cosmic Knowledge Nexus free to use?",
                answer: "Yes, Cosmic Knowledge Nexus is completely free to use. Create your account and start building your knowledge universe today."
              },
              {
                question: "Can I export my knowledge graph?",
                answer: "Currently, we're working on export functionality to allow you to download your knowledge graph in various formats. This feature will be available in an upcoming update."
              },
              {
                question: "How is my data protected?",
                answer: "Your data is securely stored and encrypted. We use industry-standard security practices to ensure your knowledge universe remains private and protected."
              },
              {
                question: "Can I collaborate with others on my knowledge graph?",
                answer: "While collaboration features aren't currently available, we're developing functionality to allow you to share specific nodes or sections of your knowledge graph with trusted collaborators."
              },
              {
                question: "What makes Cosmic Knowledge Nexus different from other knowledge management tools?",
                answer: "Cosmic Knowledge Nexus uniquely combines visual knowledge mapping with AI-powered insights, all within an intuitive cosmic-themed interface. Our focus on discovering connections between ideas sets us apart from traditional note-taking or knowledge management tools."
              },
              {
                question: "How do I get started?",
                answer: "Simply create an account, then begin adding knowledge nodes representing your interests, ideas, or concepts. From there, establish connections between nodes and explore the insights that emerge from your growing knowledge universe."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative group hover:border-indigo-500/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-xl font-bold mb-4 text-white flex items-center justify-between cursor-pointer">
                  {faq.question}
                  <i className="bi bi-plus-circle text-indigo-400"></i>
                </h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-400 mb-6">Still have questions?</p>
            <a href="mailto:stormshots0911@gmail.com" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20">
              <i className="bi bi-envelope mr-2"></i>
              <span>Talk to Creator</span>
            </a>
          </motion.div>
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
              Begin Your <span className="text-indigo-400">Cosmic Journey</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6 mb-10">
              Start mapping your knowledge universe and discover new connections today.
            </p>
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