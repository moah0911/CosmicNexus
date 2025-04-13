import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState, useRef } from 'react'

const Home = () => {
  const { user } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const heroRef = useRef(null)
  
  useEffect(() => {
    setIsLoaded(true)
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen relative overflow-hidden flex items-center">
        {/* Cosmic Background */}
        <div className="absolute inset-0 bg-black -z-20">
          <div className="absolute inset-0 opacity-30" 
               style={{
                 backgroundImage: `url("https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80")`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 filter: 'brightness(0.7)',
                 transform: `scale(${1 + scrollPosition * 0.0005}) translateY(${scrollPosition * 0.2}px)`
               }}>
          </div>
        </div>
        
        {/* Animated Stars */}
        <div className="absolute inset-0 -z-10">
          {Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 2 + 1
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  height: `${size}px`,
                  width: `${size}px`, 
                  opacity: Math.random() * 0.7 + 0.3,
                  animationDuration: `${Math.random() * 5 + 2}s`,
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: `0 0 ${size * 4}px ${size}px rgba(255, 255, 255, 0.8)`,
                  transform: `translateY(${scrollPosition * (Math.random() * 0.2)}px)`
                }}
              ></div>
            )
          })}
        </div>
        
        {/* Animated Nebulas */}
        <div className="absolute inset-0 -z-15 overflow-hidden">
          <div className="absolute h-[700px] w-[700px] rounded-full bg-purple-600/15 blur-[180px] animate-float" 
               style={{ 
                 top: '5%', 
                 left: '-15%', 
                 animationDuration: '25s',
                 transform: `translateY(${scrollPosition * -0.1}px) scale(${1 + scrollPosition * 0.0002})`
               }}></div>
          <div className="absolute h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[150px] animate-float" 
               style={{ 
                 bottom: '-15%', 
                 right: '-10%', 
                 animationDuration: '30s', 
                 animationDelay: '2s',
                 transform: `translateY(${scrollPosition * -0.15}px) scale(${1 + scrollPosition * 0.0003})`
               }}></div>
          <div className="absolute h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px] animate-float" 
               style={{ 
                 top: '35%', 
                 right: '15%', 
                 animationDuration: '20s', 
                 animationDelay: '1s',
                 transform: `translateY(${scrollPosition * -0.12}px) scale(${1 + scrollPosition * 0.0002})`
               }}></div>
        </div>
        
        {/* Animated Orbital Rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-5 opacity-20">
          <div className="absolute h-[700px] w-[700px] rounded-full border-2 border-purple-400/30 animate-spin-slow"
               style={{ transform: `scale(${1 - scrollPosition * 0.0005})` }}></div>
          <div className="absolute h-[900px] w-[900px] rounded-full border-2 border-indigo-400/30 animate-spin-slow"
               style={{ 
                 animationDirection: 'reverse', 
                 animationDuration: '80s',
                 transform: `scale(${1 - scrollPosition * 0.0004})`
               }}></div>
          <div className="absolute h-[1100px] w-[1100px] rounded-full border-2 border-blue-400/30 animate-spin-slow"
               style={{ 
                 animationDuration: '100s',
                 transform: `scale(${1 - scrollPosition * 0.0003})`
               }}></div>
        </div>
        
        {/* Shooting Stars */}
        <div className="absolute inset-0 overflow-hidden -z-5">
          {Array.from({ length: 5 }).map((_, i) => {
            const top = Math.random() * 50
            const left = Math.random() * 100
            const duration = Math.random() * 3 + 2
            const delay = Math.random() * 15
            const size = Math.random() * 100 + 50
            
            return (
              <div 
                key={i}
                className="absolute h-0.5 w-0.5 bg-white rounded-full"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  boxShadow: '0 0 4px 2px rgba(255, 255, 255, 0.8)',
                  opacity: 0,
                  animation: `shootingStar ${duration}s linear ${delay}s infinite`
                }}
              >
                <div 
                  className="absolute h-0.5 rounded-full bg-gradient-to-r from-white via-purple-400 to-transparent"
                  style={{
                    width: `${size}px`,
                    transform: 'translateX(-100%)',
                    opacity: 0.6
                  }}
                ></div>
              </div>
            )
          })}
        </div>
        
        <div 
          className={`container mx-auto px-6 py-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transform: `translateY(${scrollPosition * -0.3}px)` }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <i className="bi bi-stars mr-2"></i> Explore Your Cosmic Knowledge
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-pulse-slow">
                  Discover the Universe
                </span>
                <span className="block text-white mt-2">of Your <span className="text-indigo-400">Interests</span></span>
              </h1>
              
              <p className="text-xl text-purple-100/90 mb-10 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                Cosmic Nexus uses advanced AI to map the hidden connections between your interests,
                helping you explore new dimensions of knowledge in your personal intellectual universe.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
                {user ? (
                  <Link to="/dashboard" 
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-medium shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      <i className="bi bi-rocket-takeoff mr-3 group-hover:animate-bounce"></i> 
                      Launch Dashboard
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" 
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-medium shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden">
                      <span className="relative z-10 flex items-center justify-center">
                        <i className="bi bi-stars mr-3 group-hover:animate-spin-slow"></i> 
                        Begin Your Journey
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </Link>
                    
                    <Link to="/login" 
                      className="group px-8 py-4 bg-transparent border-2 border-purple-400/50 hover:border-purple-400 rounded-full text-xl font-medium shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all duration-300 backdrop-blur-sm">
                      <span className="flex items-center justify-center">
                        <i className="bi bi-box-arrow-in-right mr-3 transition-transform duration-300 group-hover:translate-x-1"></i> 
                        Log In
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative hidden lg:block animate-fadeIn" style={{ animationDelay: '1.1s' }}>
              {/* Central Glowing Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-80 blur-xl animate-pulse-slow"></div>
              
              {/* 3D Cosmic Sphere */}
              <div className="relative w-[500px] h-[500px] mx-auto">
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border-2 border-purple-400/30 animate-spin-slow"
                     style={{ transformStyle: 'preserve-3d', transform: 'rotateX(65deg) rotateY(0deg)' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border-2 border-indigo-400/40 animate-spin-slow"
                     style={{ transformStyle: 'preserve-3d', transform: 'rotateX(30deg) rotateY(60deg)', animationDirection: 'reverse', animationDuration: '30s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full border-2 border-blue-400/50 animate-spin-slow"
                     style={{ transformStyle: 'preserve-3d', transform: 'rotateX(80deg) rotateY(20deg)', animationDuration: '20s' }}></div>
                
                {/* Orbital Nodes */}
                <div className="absolute top-[25%] left-[75%] w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(147,51,234,0.7)] flex items-center justify-center animate-pulse-slow">
                  <i className="bi bi-stars text-white text-xl"></i>
                </div>
                <div className="absolute top-[65%] left-[30%] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 shadow-[0_0_20px_rgba(99,102,241,0.7)] flex items-center justify-center animate-pulse-slow"
                     style={{ animationDelay: '1s' }}>
                  <i className="bi bi-lightbulb text-white text-lg"></i>
                </div>
                <div className="absolute top-[40%] left-[20%] w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.7)] flex items-center justify-center animate-pulse-slow"
                     style={{ animationDelay: '0.5s' }}>
                  <i className="bi bi-diagram-3 text-white text-sm"></i>
                </div>
                
                {/* Connection Lines */}
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2">
                  <svg width="100%" height="100%" viewBox="0 0 400 400" className="absolute top-0 left-0">
                    <line x1="300" y1="100" x2="200" y2="200" stroke="url(#purple-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse-slow">
                      <animate attributeName="stroke-dashoffset" from="0" to="20" dur="3s" repeatCount="indefinite" />
                    </line>
                    <line x1="120" y1="260" x2="200" y2="200" stroke="url(#indigo-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse-slow" style={{ animationDelay: '1s' }}>
                      <animate attributeName="stroke-dashoffset" from="0" to="20" dur="4s" repeatCount="indefinite" />
                    </line>
                    <line x1="80" y1="160" x2="200" y2="200" stroke="url(#blue-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse-slow" style={{ animationDelay: '0.5s' }}>
                      <animate attributeName="stroke-dashoffset" from="0" to="20" dur="5s" repeatCount="indefinite" />
                    </line>
                    <line x1="300" y1="100" x2="120" y2="260" stroke="url(#purple-blue-gradient)" strokeWidth="1" strokeDasharray="3,3" className="animate-pulse-slow" style={{ animationDelay: '1.5s' }}>
                      <animate attributeName="stroke-dashoffset" from="0" to="12" dur="6s" repeatCount="indefinite" />
                    </line>
                    <line x1="80" y1="160" x2="300" y2="100" stroke="url(#indigo-purple-gradient)" strokeWidth="1" strokeDasharray="3,3" className="animate-pulse-slow" style={{ animationDelay: '2s' }}>
                      <animate attributeName="stroke-dashoffset" from="0" to="12" dur="7s" repeatCount="indefinite" />
                    </line>
                    
                    <defs>
                      <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="purple-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                      <linearGradient id="indigo-purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Central Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(147,51,234,0.8)] flex items-center justify-center z-20">
                  <i className="bi bi-brain text-white text-3xl"></i>
                </div>
              </div>
              
              {/* Floating Info Cards */}
              <div className="absolute -bottom-10 -right-10 bg-black/80 backdrop-blur-xl rounded-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] p-6 max-w-[280px] border border-purple-500/30 transform rotate-3 z-30 animate-float" style={{ animationDuration: '6s' }}>
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">Cosmic Connections</div>
                <div className="text-purple-100/80">AI-powered insights reveal the hidden fabric of your knowledge universe, connecting ideas across dimensions.</div>
              </div>
              
              <div className="absolute -top-5 -left-5 bg-black/80 backdrop-blur-xl rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.3)] p-6 max-w-[260px] border border-indigo-500/30 transform -rotate-2 z-30 animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }}>
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 mb-2">Celestial Discoveries</div>
                <div className="text-indigo-100/80">Explore new intellectual territories with AI-generated insights based on your unique knowledge constellation.</div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
            <span className="text-purple-300 mb-2">Explore More</span>
            <i className="bi bi-chevron-down text-2xl text-purple-400"></i>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[3rem] relative overflow-hidden my-12">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute h-64 w-64 rounded-full border-2 border-purple-300 top-10 -left-20 animate-spin-slow"></div>
          <div className="absolute h-96 w-96 rounded-full border-2 border-indigo-300 bottom-10 -right-40 animate-spin-slow" style={{ animationDuration: '120s' }}></div>
          <div className="absolute h-40 w-40 rounded-full border-2 border-purple-300 bottom-40 left-1/4 animate-spin-slow" style={{ animationDuration: '80s' }}></div>
          <div className="absolute h-20 w-20 rounded-full bg-purple-400/10 animate-float" style={{ top: '20%', right: '15%', animationDelay: '0.5s' }}></div>
          <div className="absolute h-32 w-32 rounded-full bg-indigo-400/10 animate-float" style={{ bottom: '15%', left: '10%', animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="text-center mb-20 relative z-10">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <i className="bi bi-stars mr-2"></i> Cosmic Journey
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Navigate Your Knowledge Universe
          </h2>
          <p className="text-xl text-neutral-700 max-w-3xl mx-auto animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            Our AI-powered platform helps you map the constellations of your interests and discover new cosmic connections between seemingly distant knowledge stars.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 relative z-10">
          <div className="bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-t-4 border-purple-500 group animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500 relative">
                <i className="bi bi-plus-circle text-4xl text-white group-hover:scale-110 transition-transform duration-500"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4 text-purple-800 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-500">Create Knowledge Nodes</h3>
            <p className="text-neutral-700 text-center text-lg">
              Map your interests, passions, and areas of expertise as cosmic nodes in your personal knowledge universe. Each node becomes a star in your intellectual constellation.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-t-4 border-indigo-500 group animate-fadeIn" style={{ animationDelay: '1s' }}>
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-500 relative">
                <i className="bi bi-diagram-3 text-4xl text-white group-hover:scale-110 transition-transform duration-500"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4 text-indigo-800 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500">Discover Cosmic Links</h3>
            <p className="text-neutral-700 text-center text-lg">
              Our AI reveals hidden connections between your knowledge nodes, creating a map of your intellectual universe with surprising pathways between distant concepts.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-t-4 border-purple-500 group animate-fadeIn" style={{ animationDelay: '1.2s' }}>
            <div className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-500 relative">
                <i className="bi bi-stars text-4xl text-white group-hover:scale-110 transition-transform duration-500"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-4 text-purple-800 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-500">Explore New Dimensions</h3>
            <p className="text-neutral-700 text-center text-lg">
              Receive cosmic discoveries that suggest new paths to explore based on your unique knowledge constellation, expanding your intellectual universe in unexpected directions.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full group-hover:w-24 transition-all duration-500"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 flex justify-center animate-fadeIn" style={{ animationDelay: '1.4s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-full blur-xl -z-10 scale-150 animate-pulse-slow"></div>
            {user ? (
              <Link to="/dashboard" 
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-medium shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden text-white">
                <span className="relative z-10 flex items-center justify-center">
                  <i className="bi bi-rocket-takeoff mr-3 group-hover:animate-bounce"></i> 
                  Explore Your Cosmic Dashboard
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            ) : (
              <Link to="/register" 
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-medium shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden text-white">
                <span className="relative z-10 flex items-center justify-center">
                  <i className="bi bi-stars mr-3 group-hover:animate-spin-slow"></i> 
                  Begin Your Cosmic Journey
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Demo Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 to-purple-900/5 -z-10"></div>
        
        {/* Animated stars */}
        <div className="absolute inset-0 -z-5">
          {Array.from({ length: 30 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  height: `${size}px`,
                  width: `${size}px`, 
                  opacity: Math.random() * 0.5 + 0.2,
                  animationDuration: `${Math.random() * 5 + 2}s`,
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: `0 0 ${size * 4}px ${size}px rgba(255, 255, 255, 0.6)`
                }}
              ></div>
            )
          })}
        </div>
        
        <div className="text-center mb-20 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium mb-4 shadow-lg">
            <i className="bi bi-galaxy mr-2"></i> Cosmic Visualization
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
            Explore Your Knowledge Galaxy
          </h2>
          <p className="text-xl text-neutral-700 max-w-3xl mx-auto">
            Navigate through the stars of your interests with our immersive cosmic visualization tools and discover the hidden constellations of your mind.
          </p>
        </div>
        
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl mx-6 border-4 border-white group animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
          
          <img 
            src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
            alt="Cosmic knowledge visualization" 
            className="w-full h-[600px] object-cover transition-all duration-700 group-hover:scale-105 group-hover:filter group-hover:brightness-110"
            crossOrigin="anonymous"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-indigo-900/80 to-transparent flex items-end">
            <div className="p-16 text-white max-w-4xl">
              <h3 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">Interactive Cosmic Explorer</h3>
              <p className="text-white/90 text-xl leading-relaxed mb-8">
                Navigate through your personal knowledge universe with our interactive cosmic explorer. Discover surprising connections between distant interests and chart new paths through your intellectual cosmos. Visualize your thoughts as a vast galaxy of interconnected stars.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-colors duration-300 group/card">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center mb-4 mx-auto group-hover/card:from-purple-500/50 group-hover/card:to-indigo-500/50 transition-all duration-300">
                    <i className="bi bi-stars text-3xl text-white"></i>
                  </div>
                  <h4 className="text-xl font-bold text-center mb-2">Interactive Visualization</h4>
                  <p className="text-white/80 text-center">
                    Explore your knowledge nodes in a beautiful 3D cosmic environment with intuitive navigation.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-colors duration-300 group/card">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center mb-4 mx-auto group-hover/card:from-indigo-500/50 group-hover/card:to-purple-500/50 transition-all duration-300">
                    <i className="bi bi-diagram-3 text-3xl text-white"></i>
                  </div>
                  <h4 className="text-xl font-bold text-center mb-2">Connection Mapping</h4>
                  <p className="text-white/80 text-center">
                    Visualize the hidden connections between your knowledge nodes as cosmic pathways.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-colors duration-300 group/card">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center mb-4 mx-auto group-hover/card:from-purple-500/50 group-hover/card:to-indigo-500/50 transition-all duration-300">
                    <i className="bi bi-lightbulb text-3xl text-white"></i>
                  </div>
                  <h4 className="text-xl font-bold text-center mb-2">AI-Powered Insights</h4>
                  <p className="text-white/80 text-center">
                    Receive cosmic discoveries and insights based on your unique knowledge constellation.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
                {user ? (
                  <Link to="/map" 
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-medium shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      <i className="bi bi-stars mr-3 group-hover:animate-spin-slow"></i> 
                      Launch Cosmic Explorer
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                ) : (
                  <Link to="/register" 
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xl font-medium shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:scale-105 overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      <i className="bi bi-rocket-takeoff mr-3 group-hover:animate-bounce"></i> 
                      Begin Your Cosmic Journey
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-[10%] right-[10%] w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/80 to-indigo-500/80 shadow-[0_0_20px_rgba(147,51,234,0.7)] flex items-center justify-center animate-float" style={{ animationDuration: '6s' }}>
            <i className="bi bi-stars text-white text-2xl"></i>
          </div>
          
          <div className="absolute top-[20%] left-[15%] w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-500/80 shadow-[0_0_20px_rgba(99,102,241,0.7)] flex items-center justify-center animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>
            <i className="bi bi-lightbulb text-white text-xl"></i>
          </div>
          
          <div className="absolute top-[40%] left-[5%] w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/80 to-indigo-500/80 shadow-[0_0_20px_rgba(147,51,234,0.7)] flex items-center justify-center animate-float" style={{ animationDuration: '7s', animationDelay: '0.5s' }}>
            <i className="bi bi-diagram-3 text-white text-lg"></i>
          </div>
        </div>
      </section>
      
      {/* Privacy Section */}
      <section className="py-32 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[3rem] relative overflow-hidden my-16">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute h-80 w-80 rounded-full border-2 border-purple-300 top-20 -right-20 rotate-45 animate-spin-slow" style={{ animationDuration: '100s' }}></div>
          <div className="absolute h-60 w-60 rounded-full border-2 border-indigo-300 bottom-10 left-1/4 rotate-12 animate-spin-slow" style={{ animationDuration: '80s', animationDirection: 'reverse' }}></div>
          <div className="absolute h-40 w-40 rounded-full border-2 border-purple-300 top-40 left-1/3 -rotate-12 animate-spin-slow" style={{ animationDuration: '60s' }}></div>
          <div className="absolute h-20 w-20 rounded-full bg-purple-400/10 animate-float" style={{ top: '30%', right: '10%', animationDelay: '0.7s' }}></div>
          <div className="absolute h-32 w-32 rounded-full bg-indigo-400/10 animate-float" style={{ bottom: '20%', left: '5%', animationDelay: '1.2s' }}></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center px-6">
          <div className="order-2 md:order-1 relative animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full opacity-70 blur-3xl animate-pulse-slow"></div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                alt="Privacy and security" 
                className="rounded-2xl shadow-2xl w-full object-cover border-4 border-white transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-purple-500/20"
                crossOrigin="anonymous"
              />
              
              {/* Floating elements */}
              <div className="absolute top-[10%] right-[10%] w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/80 to-indigo-500/80 shadow-[0_0_20px_rgba(147,51,234,0.7)] flex items-center justify-center animate-float" style={{ animationDuration: '6s' }}>
                <i className="bi bi-shield-lock text-white text-2xl"></i>
              </div>
              
              <div className="absolute bottom-[15%] left-[10%] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-500/80 shadow-[0_0_20px_rgba(99,102,241,0.7)] flex items-center justify-center animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>
                <i className="bi bi-database-lock text-white text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium mb-6 shadow-lg">
              <i className="bi bi-shield-check mr-2"></i> Cosmic Privacy Shield
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              Your Cosmic Data Stays Private
            </h2>
            <p className="text-xl text-neutral-700 mb-8 leading-relaxed">
              Cosmic Nexus is designed with privacy as a fundamental principle. Your knowledge nodes, connections, and AI-generated insights remain in your personal universe, protected by our advanced cosmic security protocols.
            </p>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-l-4 border-purple-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                    <i className="bi bi-shield-lock-fill text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">Private Universe</h3>
                    <p className="text-neutral-700">Your cosmic data remains in your private universe, accessible only to you and the entities you explicitly authorize.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-l-4 border-indigo-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300">
                    <i className="bi bi-database-lock text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-indigo-800 mb-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">Secure Cosmic Vault</h3>
                    <p className="text-neutral-700">Your data is stored securely with advanced encryption in our cosmic vault, protected by multiple layers of security.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-l-4 border-purple-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                    <i className="bi bi-eye-slash text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">No Cosmic Surveillance</h3>
                    <p className="text-neutral-700">We don't track your cosmic activity for advertising or share your data with third-party entities across the universe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-32 my-16 relative overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 -z-10"></div>
        
        {/* Animated stars */}
        <div className="absolute inset-0 overflow-hidden -z-5">
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 2 + 0.5
            const top = Math.random() * 100
            const left = Math.random() * 100
            const delay = Math.random() * 5
            const duration = Math.random() * 3 + 2
            
            return (
              <div 
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{ 
                  top: `${top}%`, 
                  left: `${left}%`,
                  height: `${size}px`,
                  width: `${size}px`, 
                  opacity: Math.random() * 0.7 + 0.3,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  boxShadow: `0 0 ${size * 4}px ${size}px rgba(255, 255, 255, 0.8)`
                }}
              ></div>
            )
          })}
        </div>
        
        {/* Animated nebulas */}
        <div className="absolute inset-0 -z-5 overflow-hidden">
          <div className="absolute h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[150px] animate-float" 
               style={{ top: '10%', left: '-10%', animationDuration: '25s' }}></div>
          <div className="absolute h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[120px] animate-float" 
               style={{ bottom: '-10%', right: '-5%', animationDuration: '30s', animationDelay: '2s' }}></div>
          <div className="absolute h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[100px] animate-float" 
               style={{ top: '40%', right: '20%', animationDuration: '20s', animationDelay: '1s' }}></div>
        </div>
        
        {/* Shooting Stars */}
        <div className="absolute inset-0 overflow-hidden -z-5">
          {Array.from({ length: 5 }).map((_, i) => {
            const top = Math.random() * 50
            const left = Math.random() * 100
            const duration = Math.random() * 3 + 2
            const delay = Math.random() * 15
            const size = Math.random() * 100 + 50
            
            return (
              <div 
                key={i}
                className="absolute h-0.5 w-0.5 bg-white rounded-full"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  boxShadow: '0 0 4px 2px rgba(255, 255, 255, 0.8)',
                  opacity: 0,
                  animation: `shootingStar ${duration}s linear ${delay}s infinite`
                }}
              >
                <div 
                  className="absolute h-0.5 rounded-full bg-gradient-to-r from-white via-purple-400 to-transparent"
                  style={{
                    width: `${size}px`,
                    transform: 'translateX(-100%)',
                    opacity: 0.6
                  }}
                ></div>
              </div>
            )
          })}
        </div>
        
        <div className="text-center px-6 relative z-10">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <i className="bi bi-rocket-takeoff mr-2"></i> Begin Your Cosmic Journey
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Ready to Explore Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">Knowledge Universe?</span>
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto text-purple-100/90 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            Chart your course through the cosmos of your interests and discover new intellectual galaxies waiting to be explored.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            {user ? (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <Link 
                  to="/dashboard" 
                  className="relative px-10 py-5 bg-white text-purple-800 hover:bg-purple-50 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <i className="bi bi-rocket-takeoff mr-3 text-2xl group-hover:animate-bounce"></i> Launch Your Cosmic Dashboard
                </Link>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                  <Link 
                    to="/register" 
                    className="relative px-10 py-5 bg-white text-purple-800 hover:bg-purple-50 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    <i className="bi bi-stars mr-3 text-2xl group-hover:animate-spin-slow"></i> Begin Your Cosmic Journey
                  </Link>
                </div>
                
                <Link 
                  to="/login" 
                  className="px-10 py-5 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                  <i className="bi bi-box-arrow-in-right mr-3 text-2xl transition-transform duration-300 group-hover:translate-x-1"></i> Return to Your Universe
                </Link>
              </>
            )}
          </div>
          
          <div className="mt-16 flex justify-center animate-fadeIn" style={{ animationDelay: '1s' }}>
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
