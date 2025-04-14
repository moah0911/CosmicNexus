import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fetchInterestNodes, fetchConnections } from '../services/interestService'

const CosmicExplorer = () => {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeNode, setActiveNode] = useState(null)
  const [viewMode, setViewMode] = useState('galaxy') // 'galaxy' or 'journey'
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [nodesResult, connectionsResult] = await Promise.all([
          fetchInterestNodes(),
          fetchConnections()
        ])

        if (nodesResult.success) {
          setNodes(nodesResult.data)
        }

        if (connectionsResult.success) {
          setConnections(connectionsResult.data)
        }
      } catch (error) {
        console.error('Error loading cosmic data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (loading || nodes.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const particles = []

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles for each node
    nodes.forEach((node, index) => {
      // Calculate position in a more distributed way
      const angle = (index / nodes.length) * Math.PI * 2
      const radius = Math.min(canvas.width, canvas.height) * 0.35 * (0.7 + Math.random() * 0.3)
      const x = canvas.width / 2 + Math.cos(angle) * radius
      const y = canvas.height / 2 + Math.sin(angle) * radius

      // Size based on connections count
      const nodeConnectionCount = connections.filter(conn =>
        conn.source_node_id === node.id || conn.target_node_id === node.id
      ).length

      const size = Math.max(3, Math.min(8, 3 + nodeConnectionCount * 0.5))
      const color = getNodeColor(node.category)
      const speed = Math.random() * 0.3 + 0.05

      particles.push({
        id: node.id,
        x,
        y,
        size,
        color,
        speed,
        angle: Math.random() * Math.PI * 2,
        node,
        originalX: x,
        originalY: y,
        pulsePhase: Math.random() * Math.PI * 2
      })
    })

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      if (viewMode === 'galaxy') {
        drawGalaxyConnections(ctx, particles, connections)
      } else {
        drawJourneyConnections(ctx, particles, connections, activeNode)
      }

      // Draw and update particles
      particles.forEach(particle => {
        // Update position with gentle movement
        if (viewMode === 'galaxy') {
          particle.pulsePhase += 0.02

          // Gentle orbital movement around original position
          const orbitRadius = particle.size * 0.8
          particle.x = particle.originalX + Math.cos(particle.angle) * orbitRadius
          particle.y = particle.originalY + Math.sin(particle.angle) * orbitRadius

          // Slowly rotate
          particle.angle += particle.speed * 0.01
        }

        // Draw particle glow
        ctx.beginPath()
        const glowRadius = particle.size * (1.5 + 0.5 * Math.sin(particle.pulsePhase))
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius * 2
        )
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, glowRadius * 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

        // Highlight active node
        if (activeNode && particle.id === activeNode.id) {
          ctx.shadowBlur = 15
          ctx.shadowColor = particle.color
          ctx.fillStyle = '#ffffff'
        } else {
          ctx.shadowBlur = 5
          ctx.shadowColor = particle.color
          ctx.fillStyle = particle.color
        }

        ctx.fill()
        ctx.closePath()

        // Draw node title for all nodes
        ctx.font = `${activeNode && particle.id === activeNode.id ? 'bold ' : ''}12px Arial`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(particle.node.title || 'Unnamed Node', particle.x, particle.y + particle.size + 15)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [loading, nodes, connections, viewMode, activeNode])

  const getNodeColor = (category) => {
    const colors = {
      'technology': '#8B5CF6', // purple-500
      'science': '#6366F1',    // indigo-500
      'art': '#EC4899',        // pink-500
      'philosophy': '#10B981', // emerald-500
      'history': '#F59E0B',    // amber-500
      'literature': '#3B82F6', // blue-500
      'music': '#8B5CF6',      // purple-500
      'film': '#EC4899',       // pink-500
      'psychology': '#10B981', // emerald-500
      'business': '#F59E0B',   // amber-500
      'hobby': '#8B5CF6',      // purple-500
      'general': '#6366F1',    // indigo-500
    }

    return colors[category?.toLowerCase()] || '#8B5CF6' // Default to purple
  }

  const drawGalaxyConnections = (ctx, particles, connections) => {
    connections.forEach(connection => {
      const sourceParticle = particles.find(p => p.id === connection.source_node_id)
      const targetParticle = particles.find(p => p.id === connection.target_node_id)

      if (sourceParticle && targetParticle) {
        // Draw connection line
        ctx.beginPath()
        ctx.moveTo(sourceParticle.x, sourceParticle.y)
        ctx.lineTo(targetParticle.x, targetParticle.y)

        // Create gradient for connection
        const gradient = ctx.createLinearGradient(
          sourceParticle.x, sourceParticle.y,
          targetParticle.x, targetParticle.y
        )
        gradient.addColorStop(0, sourceParticle.color)
        gradient.addColorStop(1, targetParticle.color)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.4
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.closePath()
      }
    })
  }

  const drawJourneyConnections = (ctx, particles, connections, activeNode) => {
    if (!activeNode) return

    // Find connections related to active node
    const relevantConnections = connections.filter(
      conn => conn.source_node_id === activeNode.id || conn.target_node_id === activeNode.id
    )

    // Draw connections
    relevantConnections.forEach(connection => {
      const sourceParticle = particles.find(p => p.id === connection.source_node_id)
      const targetParticle = particles.find(p => p.id === connection.target_node_id)

      if (sourceParticle && targetParticle) {
        // Draw connection line with animation
        ctx.beginPath()

        // Create animated dashed line
        ctx.setLineDash([5, 5])
        ctx.lineDashOffset = -performance.now() / 100

        ctx.moveTo(sourceParticle.x, sourceParticle.y)
        ctx.lineTo(targetParticle.x, targetParticle.y)

        // Create gradient for connection
        const gradient = ctx.createLinearGradient(
          sourceParticle.x, sourceParticle.y,
          targetParticle.x, targetParticle.y
        )
        gradient.addColorStop(0, sourceParticle.color)
        gradient.addColorStop(1, targetParticle.color)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.8
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
        ctx.closePath()

        // Draw connection strength or type
        const midX = (sourceParticle.x + targetParticle.x) / 2
        const midY = (sourceParticle.y + targetParticle.y) / 2

        ctx.font = '10px Arial'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(connection.relationship_type || 'related', midX, midY - 5)
      }
    })
  }

  const handleCanvasClick = (e) => {
    if (loading || nodes.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate all particle positions (similar to the useEffect)
    const particles = []
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2
      const radius = Math.min(canvas.width, canvas.height) * 0.35 * (0.7 + Math.random() * 0.3)
      const nodeX = canvas.width / 2 + Math.cos(angle) * radius
      const nodeY = canvas.height / 2 + Math.sin(angle) * radius

      const nodeConnectionCount = connections.filter(conn =>
        conn.source_node_id === node.id || conn.target_node_id === node.id
      ).length

      const size = Math.max(3, Math.min(8, 3 + nodeConnectionCount * 0.5))

      particles.push({
        id: node.id,
        x: nodeX,
        y: nodeY,
        size: size + 10, // Add padding for easier clicking
        node
      })
    })

    // Find clicked node
    const clickedParticle = particles.find(particle => {
      const distance = Math.sqrt(
        Math.pow(particle.x - x, 2) + Math.pow(particle.y - y, 2)
      )
      return distance <= particle.size
    })

    if (clickedParticle) {
      console.log("Node clicked:", clickedParticle.node)
      setActiveNode(clickedParticle.node)
      setViewMode('journey')
    } else if (viewMode === 'journey') {
      // Click on empty space in journey mode returns to galaxy view
      setViewMode('galaxy')
      setActiveNode(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black bg-opacity-70">
        <div className="relative">
          {/* Sparkle effects */}
          <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '-20px', left: '20px', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30px', left: '80px', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70px', left: '-15px', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mb-4 relative overflow-hidden"
              style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
              <i className="bi bi-stars text-3xl relative z-10"></i>
              <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
                style={{
                  animationDuration: '3s',
                  boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
                }}>
              </div>
            </div>
            <h2 className="text-xl font-medium text-purple-200">Generating cosmic visualization...</h2>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state if no nodes
  if (!loading && nodes.length === 0) {
    return (
      <div className="relative min-h-[80vh]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
            style={{
              textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
              letterSpacing: '0.05em'
            }}>
            Cosmic Discoveries
          </h1>
          <p className="text-purple-300 text-lg max-w-2xl"
            style={{
              textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
              lineHeight: '1.6'
            }}>
            Begin your journey by adding celestial nodes representing your interests, passions, and areas of curiosity.
          </p>
        </div>

        <div className="p-12 rounded-xl bg-black/40 border border-purple-800/30 text-center relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}>
          {/* Subtle animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl blur-xl opacity-30"></div>

          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-6 relative overflow-hidden"
            style={{ boxShadow: '0 0 15px rgba(147, 51, 234, 0.5)' }}>
            <i className="bi bi-stars text-4xl relative z-10"></i>
            <div className="absolute inset-0 bg-purple-500 opacity-0 animate-pulse"
              style={{
                animationDuration: '3s',
                boxShadow: 'inset 0 0 20px rgba(192, 132, 252, 0.5)'
              }}>
            </div>
          </div>
          <h3 className="text-2xl font-medium text-purple-200 mb-3">Your Cosmic Universe Awaits</h3>
          <p className="text-purple-300 mb-8 max-w-md mx-auto">
            Begin your journey by adding celestial nodes representing your interests, passions, and areas of curiosity.
          </p>
          <Link to="/dashboard"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 inline-block"
            style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}
          >
            Create Your First Cosmic Node
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[80vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-400 to-purple-400"
          style={{
            textShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
            letterSpacing: '0.05em'
          }}>
          Cosmic Explorer
        </h1>
        <p className="text-purple-300 text-lg max-w-2xl"
          style={{
            textShadow: '0 0 10px rgba(147, 51, 234, 0.2)',
            lineHeight: '1.6'
          }}>
          <span className="text-indigo-300 font-medium">Navigate</span> through the cosmic web of knowledge and <span className="text-indigo-300 font-medium">discover</span> hidden connections between your interests.
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => { setViewMode('galaxy'); setActiveNode(null); }}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center ${
              viewMode === 'galaxy'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white'
                : 'border border-purple-700 text-purple-300'
            }`}
            style={viewMode === 'galaxy' ? { boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)' } : {}}
          >
            <i className="bi bi-galaxy mr-2"></i>
            <span>Galaxy View</span>
          </button>

          <button
            onClick={() => setViewMode('journey')}
            className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center ${
              viewMode === 'journey'
                ? 'bg-gradient-to-r from-indigo-700 to-blue-700 text-white'
                : 'border border-indigo-700 text-indigo-300'
            }`}
            style={viewMode === 'journey' ? { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' } : {}}
            disabled={!activeNode}
          >
            <i className="bi bi-signpost-split mr-2"></i>
            <span>Journey View</span>
          </button>
        </div>

        <Link
          to="/map"
          className="px-4 py-2 rounded-full border border-purple-700 text-purple-300 hover:text-white relative overflow-hidden group transition-all duration-300 hover:border-purple-500 flex items-center"
          style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)' }}
        >
          <span className="relative z-10 transition-colors duration-300">Return to Map</span>
          <i className="bi bi-arrow-right ml-2 relative z-10"></i>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-800 to-indigo-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-80"></span>
        </Link>
      </div>

      {/* Active Node Info */}
      {activeNode && (
        <motion.div
          className="mb-6 p-4 rounded-xl bg-black/40 border border-purple-800/30 relative overflow-hidden"
          style={{ boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 rounded-xl blur-xl opacity-50"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-800 to-indigo-800 flex items-center justify-center text-white mr-3">
                <i className="bi bi-stars text-sm"></i>
              </div>
              <h3 className="text-xl font-medium text-purple-200">{activeNode.title || 'Unnamed Node'}</h3>
              <span className="ml-3 px-2 py-0.5 text-xs rounded-full bg-purple-900/50 text-purple-300">
                {activeNode.category || 'Uncategorized'}
              </span>
            </div>

            <p className="text-purple-300 ml-11">{activeNode.description || 'No description available.'}</p>

            <div className="mt-3 ml-11 flex flex-wrap gap-2">
              {activeNode.tags && activeNode.tags.length > 0 && activeNode.tags.map((tag, index) => (
                <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-indigo-900/50 text-indigo-300">
                  {tag}
                </span>
              ))}

              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-900/50 text-blue-300 ml-auto">
                {(() => {
                  const connectionCount = connections.filter(
                    conn => conn.source_node_id === activeNode.id || conn.target_node_id === activeNode.id
                  ).length;
                  return `Connected to ${connectionCount === 1 ? '1 other node' : connectionCount + ' other nodes'}`;
                })()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-purple-900/30 bg-black/40"
        style={{
          height: '60vh',
          boxShadow: '0 0 30px rgba(147, 51, 234, 0.1) inset'
        }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onClick={handleCanvasClick}
        ></canvas>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/70 rounded-lg border border-purple-900/30 text-purple-300 text-sm">
          <p className="flex items-center">
            <i className="bi bi-info-circle mr-2 text-indigo-400"></i>
            {viewMode === 'galaxy'
              ? 'Click on any node to explore its connections in Journey View'
              : 'Exploring connections for selected node. Click empty space to return to Galaxy View'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-xl bg-black/40 border border-purple-800/30">
        <h3 className="text-lg font-medium text-purple-200 mb-3">Cosmic Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Technology</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Science</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Art & Design</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Philosophy</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-purple-300 text-sm">History</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Literature</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Music</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Hobby</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="text-purple-300 text-sm">General</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-purple-300 text-sm">Other</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CosmicExplorer