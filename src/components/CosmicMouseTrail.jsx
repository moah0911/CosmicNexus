import { useState, useEffect, useRef } from 'react'

// Function to draw a star shape
const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, color) => {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

const CosmicMouseTrail = () => {
  const [particles, setParticles] = useState([])
  const requestRef = useRef()
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const previousTimeRef = useRef()
  const canvasRef = useRef(null)

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event) => {
      mousePositionRef.current = { x: event.clientX, y: event.clientY }

      // Add new particle on mouse move
      if (Math.random() > 0.5) { // Only add particles occasionally for performance
        addParticle(event.clientX, event.clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Add a new particle
  const addParticle = (x, y) => {
    const size = Math.random() * 5 + 2
    const speedX = (Math.random() - 0.5) * 2
    const speedY = (Math.random() - 0.5) * 2
    const opacity = Math.random() * 0.5 + 0.3
    const rotation = Math.random() * Math.PI * 2
    const rotationSpeed = (Math.random() - 0.5) * 0.1

    // Choose a color from cosmic palette
    const colors = [
      'rgba(147, 51, 234, opacity)', // Purple
      'rgba(79, 70, 229, opacity)',  // Indigo
      'rgba(219, 39, 119, opacity)', // Pink
      'rgba(139, 92, 246, opacity)', // Violet
      'rgba(59, 130, 246, opacity)',  // Blue
      'rgba(236, 72, 153, opacity)'  // Rose
    ]

    const color = colors[Math.floor(Math.random() * colors.length)].replace('opacity', opacity)

    const newParticle = {
      x,
      y,
      size,
      color,
      speedX,
      speedY,
      opacity,
      rotation,
      rotationSpeed,
      life: 100, // Particle lifetime
    }

    setParticles(prevParticles => [...prevParticles, newParticle])
  }

  // Animation loop
  const animate = (time) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time
    }

    const deltaTime = time - previousTimeRef.current
    previousTimeRef.current = time

    // Update particles
    setParticles(prevParticles =>
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY,
          rotation: particle.rotation + particle.rotationSpeed,
          life: particle.life - 1,
          opacity: particle.opacity * 0.98, // Fade out
          size: particle.size * 0.995 // Slightly shrink
        }))
        .filter(particle => particle.life > 0) // Remove dead particles
    )

    // Draw particles
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update canvas size if window was resized
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      // Draw each particle
      particles.forEach(particle => {
        // Set shadow for glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = particle.color

        // Randomly choose between circle and star
        if (Math.random() > 0.7) {
          // Draw star
          drawStar(ctx, particle.x, particle.y, 5, particle.size, particle.size/2, particle.color)
        } else {
          // Draw circle
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.fill()
        }
      })
    }

    requestRef.current = requestAnimationFrame(animate)
  }

  // Setup and cleanup animation frame
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [particles])

  // Setup canvas
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ pointerEvents: 'none' }}
    />
  )
}

export default CosmicMouseTrail
