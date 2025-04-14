import { useEffect, useRef, useState } from 'react';

const SimpleMouseTrail = () => {
  const canvasRef = useRef(null);
  const [debugMode, setDebugMode] = useState(false);

  // Toggle debug mode with Alt+D key combination
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'd') {
        setDebugMode(prev => !prev);
        console.log('Mouse trail debug mode:', !debugMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;

    // Set canvas size to full window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Track mouse position
    let prevMouseX = null;
    let prevMouseY = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Add new particles on mouse move, but only if there's significant movement
      const velocity = Math.sqrt(Math.pow(mouseX - (prevMouseX || mouseX), 2) + Math.pow(mouseY - (prevMouseY || mouseY), 2));
      if (velocity > 2) { // Lower threshold for more consistent trail
        // Add more particles for faster movements
        const particleCount = velocity > 10 ? 3 : 2;
        addParticles(mouseX, mouseY, particleCount);
      }

      // Store previous position
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2; // Smaller size for subtlety
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = getRandomColor();
        this.life = 40; // Moderate lifespan
        this.isStar = Math.random() > 0.4; // 60% chance to be a star for better balance
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        // Shrink very slowly to maintain visibility longer
        this.size = Math.max(0, this.size * 0.99);
      }

      draw() {
        // Fade out gradually
        const opacity = Math.min(0.7, this.life / 40); // Lower max opacity for subtlety
        ctx.globalAlpha = opacity;

        // Add subtle glow effect for all particles
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;

        if (this.isStar) {
          // Make stars slightly smaller for cosmic feel
          const starSize = this.size * 0.9;
          drawStar(ctx, this.x, this.y, 5, starSize, starSize/2, this.color);

          // Add a subtle pulse effect to stars
          const pulseAmount = Math.sin(this.life * 0.2) * 0.2;
          const pulseGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, starSize * (2 + pulseAmount)
          );
          // Handle both hex and rgba color formats
          let pulseColor;
          if (this.color.startsWith('#')) {
            // Convert hex to rgba
            const hex = this.color.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            pulseColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
          } else {
            // Already rgba format
            pulseColor = this.color.replace(')', ', 0.1)');
          }
          pulseGradient.addColorStop(0, pulseColor);
          pulseGradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.beginPath();
          ctx.arc(this.x, this.y, starSize * (2 + pulseAmount), 0, Math.PI * 2);
          ctx.fillStyle = pulseGradient;
          ctx.fill();
        } else {
          // Draw a circle with subtle glow
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();

          // Add subtle glow for circles
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 1.8
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
    }

    // Function to draw a star
    function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }

      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();

      // Create a subtle gradient fill for the star
      const starGradient = ctx.createRadialGradient(
        cx, cy, innerRadius * 0.5,
        cx, cy, outerRadius
      );

      // Extract RGB components from the color hex
      let r, g, b;
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        // Default fallback
        r = 147; g = 51; b = 234; // Purple
      }

      starGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      starGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.7)`);

      ctx.fillStyle = starGradient;
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
    }

    // Get random color from cosmic palette - more purples and indigos to match UI
    function getRandomColor() {
      // Weighted color palette that favors purples and indigos
      const colors = [
        // Primary colors - higher probability (duplicated for higher chance)
        '#9333EA', // purple-600
        '#9333EA', // purple-600 (duplicated)
        '#8B5CF6', // violet-500
        '#8B5CF6', // violet-500 (duplicated)
        '#A855F7', // purple-500
        '#A855F7', // purple-500 (duplicated)
        '#C084FC', // purple-400
        '#6366F1', // indigo-500
        '#6366F1', // indigo-500 (duplicated)
        '#818CF8', // indigo-400
        '#818CF8', // indigo-400 (duplicated)

        // Accent colors - lower probability
        '#7E22CE', // purple-700
        '#4F46E5', // indigo-600
        '#4338CA', // indigo-700
        '#7C3AED', // violet-600
        '#6D28D9', // violet-700
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // Add multiple particles at once
    function addParticles(x, y, count) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(
          x + (Math.random() - 0.5) * 8, // Less randomness for more precise trail
          y + (Math.random() - 0.5) * 8
        ));
      }

      // Limit particles for performance and subtlety
      if (particles.length > 60) {
        particles = particles.slice(-60);
      }
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw debug info if debug mode is enabled
      if (debugMode) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText(`Mouse Trail Debug Mode: ON`, 20, 30);
        ctx.fillText(`Particles: ${particles.length}`, 20, 60);
        ctx.fillText(`Mouse Position: ${mouseX}, ${mouseY}`, 20, 90);

        // Draw a visible cursor position indicator
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fill();
      }

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(index, 1);
        }
      });

      // Reset shadow for performance
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9999,
        opacity: 1,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none'
      }}
    />
  );
};

export default SimpleMouseTrail;
