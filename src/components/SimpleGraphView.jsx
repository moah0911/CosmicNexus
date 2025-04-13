import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SimpleGraphView = ({ nodes, connections, onNodeClick, onDeleteConnection, onCreateConnection }) => {
  const graphRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [graphReady, setGraphReady] = useState(false);
  const [darkMode] = useState(true); // Default to dark mode
  
  // Basic validation
  const validNodes = Array.isArray(nodes) ? nodes : [];
  const validConnections = Array.isArray(connections) ? connections : [];
  
  // Transform data for the graph
  const graphData = useMemo(() => {
    console.log("GraphView rendering with nodes:", validNodes.length);
    console.log("GraphView rendering with connections:", validConnections.length);
    
    // Create graph nodes
    const graphNodes = validNodes.map(node => ({
      id: node.id,
      name: node.title,
      category: node.category,
      description: node.description,
      val: 3 // Base size of node
    }));
    
    // Create graph links
    const graphLinks = validConnections.map(conn => ({
      id: `${conn.source_node_id}-${conn.target_node_id}`,
      source: conn.source_node_id,
      target: conn.target_node_id,
      value: conn.strength || 1,
      description: conn.description,
      connection_id: conn.id
    }));
    
    return { nodes: graphNodes, links: graphLinks };
  }, [validNodes, validConnections]);
  
  // Get color based on category
  const getNodeColor = (category) => {
    switch (category) {
      case 'art': return '#f43f5e'; // rose-500
      case 'science': return '#3b82f6'; // blue-500
      case 'history': return '#f59e0b'; // amber-500
      case 'music': return '#a855f7'; // purple-500
      case 'literature': return '#10b981'; // emerald-500
      case 'philosophy': return '#6366f1'; // indigo-500
      case 'technology': return '#06b6d4'; // cyan-500
      case 'hobby': return '#ec4899'; // pink-500
      default: return '#6b7280'; // gray-500
    }
  };
  
  // Initialize graph when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setGraphReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle node click
  const handleNodeClick = (node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };
  
  // Handle link click for deletion
  const handleLinkClick = (link) => {
    if (onDeleteConnection && link.connection_id) {
      if (window.confirm('Are you sure you want to delete this connection?')) {
        onDeleteConnection(link.connection_id);
      }
    }
  };
  
  // Error handling for empty data
  if (validNodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-black to-purple-950 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          boxShadow: '0 0 15px rgba(147, 51, 234, 0.3), 0 0 30px rgba(139, 92, 246, 0.2)',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
        {/* Sparkle effects */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70%', left: '15%', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '1.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ top: '80%', left: '75%', animationDelay: '0.3s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
        </div>
        
        <div className="text-center text-purple-200 z-10 p-8 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg border border-purple-900">
          <i className="bi bi-stars text-5xl mb-4 text-purple-400"></i>
          <h3 className="text-2xl font-medium mb-3 text-purple-200">Cosmic Void Detected</h3>
          <p className="text-purple-300 mb-6">Your universe awaits creation. Add some celestial nodes to begin visualizing your cosmic knowledge.</p>
          <button 
            onClick={() => toast.info('Click the "Add Node" button to create your first node!')}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full shadow-lg transform transition-transform hover:scale-105"
            style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)' }}
          >
            <i className="bi bi-plus-circle mr-2"></i>
            Create First Node
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (!graphReady) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-black to-purple-950 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          boxShadow: '0 0 15px rgba(147, 51, 234, 0.3), 0 0 30px rgba(139, 92, 246, 0.2)',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
        {/* Sparkle effects */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70%', left: '15%', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '1.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ top: '80%', left: '75%', animationDelay: '0.3s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
        </div>
        
        <div className="text-center text-purple-200 z-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
                <i className="bi bi-stars text-purple-300"></i>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-medium mb-2 text-purple-200">Cosmic Alignment</h3>
          <p className="text-purple-300">Preparing your celestial knowledge visualization...</p>
        </div>
      </div>
    );
  }
  
  // Render the graph
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[600px] bg-gradient-to-br from-black to-purple-950 rounded-xl shadow-2xl overflow-hidden relative"
      style={{
        boxShadow: '0 0 15px rgba(147, 51, 234, 0.3), 0 0 30px rgba(139, 92, 246, 0.2)',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}
    >
      {/* Sparkle effects */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute h-2 w-2 rounded-full bg-purple-400 animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-indigo-400 animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1.2s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ top: '70%', left: '15%', animationDelay: '0.7s', boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.8)' }}></div>
        <div className="absolute h-1 w-1 rounded-full bg-purple-400 animate-pulse" style={{ top: '40%', left: '60%', animationDelay: '1.5s', boxShadow: '0 0 8px 2px rgba(192, 132, 252, 0.8)' }}></div>
        <div className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse" style={{ top: '80%', left: '75%', animationDelay: '0.3s', boxShadow: '0 0 8px 2px rgba(129, 140, 248, 0.8)' }}></div>
      </div>
      
      {/* Fallback content in case ForceGraph fails to render */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="text-purple-200 text-center">
          <i className="bi bi-stars text-6xl mb-4 text-purple-300"></i>
          <h3 className="text-xl">Loading cosmic visualization...</h3>
        </div>
      </div>
      
      {/* The actual graph */}
      <div className="relative z-10 w-full h-full">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={node => `${node.name}`}
          nodeColor={node => getNodeColor(node.category)}
          nodeRelSize={8}
          backgroundColor={'#0f0a1e'} 
          linkColor={() => 'rgba(192, 132, 252, 0.3)'}
          linkWidth={1.5}
          linkDirectionalParticles={5}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.01}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Draw node circle with glow effect
            const size = node.val * 1.5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            ctx.fillStyle = getNodeColor(node.category);
            ctx.fill();
            
            // Add glow effect
            const glow = ctx.createRadialGradient(node.x, node.y, size, node.x, node.y, size * 2);
            glow.addColorStop(0, `${getNodeColor(node.category)}80`);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size * 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add node label if zoomed in enough
            if (globalScale > 1) {
              ctx.font = '6px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'white';
              ctx.fillText(node.name, node.x, node.y + size + 6);
            }
          }}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onNodeHover={setHoveredNode}
          cooldownTimes={100}
        />
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button 
          onClick={() => {
            if (onCreateConnection) {
              toast.info('Connection mode enabled. Click on two nodes to create a connection.');
            }
          }}
          className="bg-purple-700 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transform transition-transform hover:scale-110"
          style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)' }}
          title="Create Connection"
        >
          <i className="bi bi-link text-lg"></i>
        </button>
      </div>
    </motion.div>
  );
};

export default SimpleGraphView;