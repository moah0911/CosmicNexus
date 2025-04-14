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

    // Enhanced cosmic mouse trail effect
    const particles = []
    const particleCount = 40 // Significantly increased for more visible effect
    const particleLifespan = 40 // Increased for longer trails

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
        this.size = size * 1.5 // Make particles 50% larger
        this.color = color
        this.speedX = speedX
        this.speedY = speedY
        this.life = particleLifespan
        this.opacity = 1
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.3
        this.shape = Math.random() > 0.4 ? 'star' : 'circle' // Even more star shapes for cosmic effect
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life--
        this.rotation += this.rotationSpeed

        // Gradually reduce size as life decreases, but not as quickly
        this.size = this.size * (0.3 + 0.7 * (this.life / particleLifespan))

        // Add stronger pulsing effect to opacity
        const pulseSpeed = 0.15
        const pulseAmount = 0.3
        const baseFade = this.life / particleLifespan
        // Keep opacity higher for longer
        const adjustedFade = Math.pow(baseFade, 0.7) // This makes the fade more gradual
        const pulse = Math.sin(this.life * pulseSpeed) * pulseAmount + 1
        this.opacity = adjustedFade * pulse
      }

      draw(ctx) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        // Add shadow for all particles
        ctx.shadowBlur = 15
        ctx.shadowColor = this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba')

        if (this.shape === 'star') {
          // Draw a star
          this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2)
        } else {
          // Draw a circle with enhanced glow
          ctx.beginPath()
          ctx.arc(0, 0, this.size, 0, Math.PI * 2)
          ctx.fillStyle = this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba')
          ctx.fill()

          // Add a stronger glow
          const gradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, this.size * 4
          )
          gradient.addColorStop(0, this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba'))
          gradient.addColorStop(0.3, this.color.replace(')', `, ${this.opacity * 0.8})`).replace('rgba', 'rgba'))
          gradient.addColorStop(0.7, this.color.replace(')', `, ${this.opacity * 0.4})`).replace('rgba', 'rgba'))
          gradient.addColorStop(1, `rgba(0, 0, 0, 0)`)

          ctx.beginPath()
          ctx.arc(0, 0, this.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Reset shadow for performance
        ctx.shadowBlur = 0
        ctx.restore()
      }

      // Method to draw a star shape
      drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3
        let x = cx
        let y = cy
        let step = Math.PI / spikes

        // Add a stronger twinkle effect by varying the radius
        const twinkleAmount = Math.sin(this.life * 0.3) * 0.3 + 1.1
        const adjustedOuterRadius = outerRadius * twinkleAmount
        const adjustedInnerRadius = innerRadius * twinkleAmount

        // Draw the star with a glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba')

        ctx.beginPath()
        ctx.moveTo(cx, cy - adjustedOuterRadius)

        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * adjustedOuterRadius
          y = cy + Math.sin(rot) * adjustedOuterRadius
          ctx.lineTo(x, y)
          rot += step

          x = cx + Math.cos(rot) * adjustedInnerRadius
          y = cy + Math.sin(rot) * adjustedInnerRadius
          ctx.lineTo(x, y)
          rot += step
        }

        ctx.lineTo(cx, cy - adjustedOuterRadius)
        ctx.closePath()
        ctx.fillStyle = this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba')
        ctx.fill()

        // Add enhanced glow to stars
        const gradient = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, adjustedOuterRadius * 3.5
        )
        gradient.addColorStop(0, this.color.replace(')', `, ${this.opacity})`).replace('rgba', 'rgba'))
        gradient.addColorStop(0.3, this.color.replace(')', `, ${this.opacity * 0.8})`).replace('rgba', 'rgba'))
        gradient.addColorStop(0.7, this.color.replace(')', `, ${this.opacity * 0.4})`).replace('rgba', 'rgba'))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(cx, cy, adjustedOuterRadius * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Reset shadow for performance
        ctx.shadowBlur = 0
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate mouse velocity
      const velocityX = mouseX - prevMouseX
      const velocityY = mouseY - prevMouseY
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)

      // Create particles with any mouse movement
      if (velocity > 0.5) {
        // Create new particles
        for (let i = 0; i < 5; i++) { // Significantly increased particle generation
          const size = Math.random() * 5 + 2 // Larger particles
          const speedX = (Math.random() - 0.5) * 3 // More varied speeds
          const speedY = (Math.random() - 0.5) * 3

          // Extremely vibrant cosmic color palette with higher opacity
          const colorOptions = [
            'rgba(129, 140, 248, 0.9)', // indigo-400
            'rgba(99, 102, 241, 0.9)',  // indigo-500
            'rgba(79, 70, 229, 0.9)',   // indigo-600
            'rgba(167, 139, 250, 0.9)', // purple-400
            'rgba(139, 92, 246, 0.9)',  // purple-500
            'rgba(124, 58, 237, 0.9)',  // purple-600
            'rgba(192, 132, 252, 0.9)', // purple-400
            'rgba(147, 51, 234, 0.9)',  // purple-600
            'rgba(59, 130, 246, 0.9)',  // blue-500
            'rgba(236, 72, 153, 0.9)',  // pink-500 for contrast
            'rgba(244, 114, 182, 0.9)', // pink-400
            'rgba(168, 85, 247, 0.9)',  // purple-500
            'rgba(217, 70, 239, 0.9)'   // fuchsia-600
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
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ opacity: 1 }} // Maximum opacity for maximum visibility
    />
  )
}

export default MouseTrail