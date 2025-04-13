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

    // Subtle cosmic mouse trail effect
    const particles = []
    const particleCount = 15 // Reduced for less intrusive effect
    const particleLifespan = 20 // Slightly reduced for shorter trails

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
        this.opacity = 1
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.1
        this.shape = Math.random() > 0.7 ? 'star' : 'circle' // Add star shapes for cosmic effect
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life--
        this.rotation += this.rotationSpeed

        // Gradually reduce size and opacity as life decreases
        this.size = this.size * (this.life / particleLifespan)
        this.opacity = this.life / particleLifespan
      }

      draw(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        if (this.shape === 'star') {
          // Draw a star
          this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2)
        } else {
          // Draw a circle with glow
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fillStyle = this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba')
          ctx.fill()

          // Add a subtle glow
          const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, this.size * 3
          )
          gradient.addColorStop(0, this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba'))
          gradient.addColorStop(1, `rgba(0, 0, 0, 0)`)

          ctx.beginPath()
          ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }

        ctx.restore()
      }

      // Method to draw a star shape
      drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3
        let x = cx
        let y = cy
        let step = Math.PI / spikes

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
        ctx.fillStyle = this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba')
        ctx.fill()

        // Add glow to stars
        const gradient = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, outerRadius * 2
        )
        gradient.addColorStop(0, this.color.replace(')', `, ${this.opacity * 0.7})`).replace('rgba', 'rgba'))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(cx, cy, outerRadius * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate mouse velocity
      const velocityX = mouseX - prevMouseX
      const velocityY = mouseY - prevMouseY
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)

      // Only create particles when mouse is moving significantly
      if (velocity > 2) {
        // Create new particles
        for (let i = 0; i < 2; i++) { // Reduced particle generation
          const size = Math.random() * 3 + 1 // Smaller particles
          const speedX = (Math.random() - 0.5) * 2 // Less varied speeds
          const speedY = (Math.random() - 0.5) * 2

          // Subtle cosmic color palette with reduced opacity
          const colorOptions = [
            'rgba(129, 140, 248, 0.5)', // indigo-400
            'rgba(99, 102, 241, 0.5)',  // indigo-500
            'rgba(79, 70, 229, 0.5)',   // indigo-600
            'rgba(167, 139, 250, 0.5)', // purple-400
            'rgba(139, 92, 246, 0.5)',  // purple-500
            'rgba(124, 58, 237, 0.5)',  // purple-600
            'rgba(192, 132, 252, 0.5)', // purple-400
            'rgba(147, 51, 234, 0.5)',  // purple-600
            'rgba(59, 130, 246, 0.5)',  // blue-500
            'rgba(236, 72, 153, 0.5)'   // pink-500 for contrast
          ];

          const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]

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
      style={{ opacity: 0.6 }} // Reduced opacity for less intrusive effect
    />
  )
}

export default MouseTrail