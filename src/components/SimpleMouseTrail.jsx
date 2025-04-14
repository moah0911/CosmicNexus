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
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Add new particles on mouse move
      addParticles(mouseX, mouseY, 3); // Add 3 particles per move
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 5; // Much larger size for visibility
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = getRandomColor();
        this.life = 60; // Much longer life
        this.isStar = Math.random() > 0.3; // 70% chance to be a star
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        // Shrink very slowly to maintain visibility longer
        this.size = Math.max(0, this.size * 0.99);
      }

      draw() {
        // Fade out more slowly
        const opacity = Math.min(1, this.life / 40);
        ctx.globalAlpha = opacity;

        // Add strong glow effect for all particles
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        if (this.isStar) {
          drawStar(ctx, this.x, this.y, 5, this.size, this.size/2, this.color);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();

          // Add extra glow for circles
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
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
      ctx.fillStyle = color;
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
    }

    // Get random color from cosmic palette
    function getRandomColor() {
      const colors = [
        '#9333EA', // purple-600
        '#8B5CF6', // violet-500
        '#A855F7', // purple-500
        '#C084FC', // purple-400
        '#6366F1', // indigo-500
        '#818CF8', // indigo-400
        '#EC4899', // pink-500
        '#F472B6', // pink-400
        '#3B82F6', // blue-500
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // Add multiple particles at once
    function addParticles(x, y, count) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(
          x + (Math.random() - 0.5) * 15, // Add more randomness to position
          y + (Math.random() - 0.5) * 15
        ));
      }

      // Limit particles for performance but allow more
      if (particles.length > 150) {
        particles = particles.slice(-150);
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
