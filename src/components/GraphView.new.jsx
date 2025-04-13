import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const GraphView = ({ nodes, connections, onNodeClick, onDeleteConnection, onCreateConnection }) => {
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
  
  // Initialize graph when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setGraphReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
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
      <div className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center text-white">
          <i className="bi bi-exclamation-triangle text-4xl mb-4"></i>
          <h3 className="text-xl font-medium mb-2">No nodes to display</h3>
          <p className="text-gray-300">Add some interest nodes to visualize your knowledge graph.</p>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (!graphReady) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
          <h3 className="text-xl font-medium mb-2">Loading Graph</h3>
          <p className="text-gray-300">Preparing your knowledge visualization...</p>
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
      className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg overflow-hidden relative"
    >
      {/* Fallback content in case ForceGraph fails to render */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="text-white text-center">
          <i className="bi bi-diagram-3 text-6xl mb-4"></i>
          <h3 className="text-xl">Loading graph visualization...</h3>
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
          backgroundColor={darkMode ? '#1a1a2e' : null}
          linkColor={() => 'rgba(255, 255, 255, 0.2)'}
          linkWidth={1.5}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={1.5}
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
          className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full shadow-lg"
          title="Create Connection"
        >
          <i className="bi bi-link text-lg"></i>
        </button>
      </div>
    </motion.div>
  );
};

export default GraphView;