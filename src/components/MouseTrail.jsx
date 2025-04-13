import { useEffect, useRef } from 'react'

const MouseTrail = () => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    // Mouse trail effect
    const particles = []
    const particleCount = 20
    const particleLifespan = 20 // frames
    
    let mouseX = 0
    let mouseY = 0
    let prevMouseX = 0
    let prevMouseY = 0
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    class Particle {
      constructor(x, y, size, color, speedX, speedY) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.speedX = speedX
        this.speedY = speedY
        this.life = particleLifespan
      }
      
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life--
        
        // Gradually reduce size as life decreases
        this.size = this.size * (this.life / particleLifespan)
      }
      
      draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Calculate mouse velocity
      const velocityX = mouseX - prevMouseX
      const velocityY = mouseY - prevMouseY
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
      
      // Only create particles when mouse is moving
      if (velocity > 1) {
        // Create new particles
        for (let i = 0; i < 2; i++) {
          const size = Math.random() * 4 + 1
          const speedX = (Math.random() - 0.5) * 2
          const speedY = (Math.random() - 0.5) * 2
          
          // Generate a random color from a gradient palette
          const hue = Math.floor(Math.random() * 60) + 200 // Blue to purple range
          const saturation = Math.floor(Math.random() * 30) + 70 // 70-100%
          const lightness = Math.floor(Math.random() * 20) + 50 // 50-70%
          const alpha = Math.random() * 0.5 + 0.2 // 0.2-0.7
          
          const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
          
          particles.push(new Particle(mouseX, mouseY, size, color, speedX, speedY))
          
          // Limit the number of particles
          if (particles.length > particleCount) {
            particles.shift()
          }
        }
      }
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update()
        particles[i].draw(ctx)
        
        // Remove dead particles
        if (particles[i].life <= 0) {
          particles.splice(i, 1)
        }
      }
      
      prevMouseX = mouseX
      prevMouseY = mouseY
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 0.7 }}
    />
  )
}

export default MouseTrail