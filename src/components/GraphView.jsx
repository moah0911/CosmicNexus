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
  
  // These functions will be defined later in the file
  // We're removing them here to avoid redeclaration errors
  
  // Get gradient colors for links
  const getLinkColor = (link) => {
    if (!link.source || !link.target) return 'rgba(100, 116, 139, 0.3)'
    
    const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source)
    const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target)
    
    if (!sourceNode || !targetNode) return 'rgba(100, 116, 139, 0.3)'
    
    // Return a gradient ID
    return `url(#${sourceNode.category}-${targetNode.category}-gradient)`
  }
  
  // Apply different layouts
  const applyLayout = (layout) => {
    if (!graphRef.current) return
    
    // Reset any fixed positions
    graphData.nodes.forEach(node => {
      node.fx = null
      node.fy = null
    })
    
    switch (layout) {
      case 'cluster': {
        // Group nodes by category
        const categories = {}
        graphData.nodes.forEach(node => {
          if (!categories[node.category]) {
            categories[node.category] = []
          }
          categories[node.category].push(node)
        })
        
        // Position each category in a cluster
        const numCategories = Object.keys(categories).length
        const radius = 250
        
        Object.entries(categories).forEach(([category, categoryNodes], i) => {
          const angle = (i / numCategories) * 2 * Math.PI
          const clusterX = radius * Math.cos(angle)
          const clusterY = radius * Math.sin(angle)
          
          // Position nodes in a small circle within their cluster
          const clusterRadius = 30 + categoryNodes.length * 5
          
          categoryNodes.forEach((node, j) => {
            const nodeAngle = (j / categoryNodes.length) * 2 * Math.PI
            node.fx = clusterX + clusterRadius * Math.cos(nodeAngle) * 0.5
            node.fy = clusterY + clusterRadius * Math.sin(nodeAngle) * 0.5
          })
        })
        
        break
      }
      
      default: {
        // Force-directed layout (default)
        graphRef.current.d3Force('charge').strength(-180)
        graphRef.current.d3Force('link').distance(link => 120)
        
        // Add collision force to prevent overlap
        graphRef.current.d3Force('collision', d3.forceCollide().radius(node => node.val * 1.5))
        
        // Add center force to keep nodes centered
        graphRef.current.d3Force('center', d3.forceCenter())
        
        break
      }
    }
    
    // Reheat the simulation
    graphRef.current.d3ReheatSimulation()
    
    // Center the graph
    setTimeout(() => {
      graphRef.current.zoomToFit(400)
    }, 500)
  }
  
  useEffect(() => {
    if (graphRef.current) {
      // Apply initial layout
      applyLayout(graphLayout)
      
      // Center the graph
      setTimeout(() => {
        graphRef.current.zoomToFit(400)
        setGraphReady(true)
      }, 500)
    }
  }, [nodes, connections, graphLayout])
  
  // Handle node hover
  const handleNodeHover = node => {
    if (node) {
      setHoveredNode(node)
      
      // Highlight connected links and nodes
      if (graphRef.current && highlightConnections) {
        const connectedLinks = graphData.links.filter(
          link => 
            (typeof link.source === 'object' ? link.source.id === node.id : link.source === node.id) || 
            (typeof link.target === 'object' ? link.target.id === node.id : link.target === node.id)
        )
        
        const connectedNodeIds = new Set()
        connectedLinks.forEach(link => {
          connectedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source)
          connectedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target)
        })
        
        // Increase size of hovered node
        node.val = node.originalVal * 1.5
        
        // Highlight connected nodes
        graphData.nodes.forEach(n => {
          if (n !== node) {
            if (connectedNodeIds.has(n.id)) {
              // Connected nodes are slightly enlarged
              n.val = n.originalVal * 1.2
            } else {
              // Non-connected nodes are diminished
              n.val = n.originalVal * 0.6
            }
          }
        })
        
        graphRef.current.refresh()
      }
    } else if (hoveredNode) {
      // Reset all nodes to original size
      graphData.nodes.forEach(n => {
        n.val = n.originalVal
      })
      
      setHoveredNode(null)
      if (graphRef.current) {
        graphRef.current.refresh()
      }
    }
  }
  
  // Handle link hover
  const handleLinkHover = link => {
    setHoveredLink(link)
  }
  
  // Handle node click
  const handleNodeClick = node => {
    if (connectionMode) {
      if (!sourceNode) {
        // First node in connection
        setSourceNode(node);
        toast.info(`Selected "${node.name}" as source. Now click another node to create a connection.`);
      } else if (sourceNode.id !== node.id) {
        // Second node - create connection
        if (onCreateConnection) {
          onCreateConnection(sourceNode.id, node.id);
          toast.success(`Created connection between "${sourceNode.name}" and "${node.name}"`);
        }
        // Reset connection mode
        setSourceNode(null);
        setTempLink(null);
      } else {
        // Clicked same node twice
        toast.info("Please select a different node to connect to.");
      }
    } else {
      // Regular node click behavior
      onNodeClick(node.id);
    }
  }
  
  // Handle mouse move for drawing temporary connection line
  const handleMouseMove = (event) => {
    if (!connectionMode) return;
    
    try {
      // Check if the graph is initialized
      if (!graphRef.current) return;
      
      // Some versions of the library might not have canvas() method
      let graphCanvas;
      try {
        graphCanvas = graphRef.current.canvas();
      } catch (e) {
        // If canvas() method is not available, try to get the DOM element directly
        graphCanvas = document.querySelector('.force-graph-container canvas');
      }
      
      if (!graphCanvas) return;
      
      const rect = graphCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Try to convert to graph coordinates if possible
      if (graphRef.current && typeof graphRef.current.screen2GraphCoords === 'function') {
        try {
          const graphCoords = graphRef.current.screen2GraphCoords(x, y);
          setMousePos(graphCoords);
        } catch (e) {
          // Fallback to screen coordinates
          setMousePos({ x, y });
        }
      } else {
        // Fallback to screen coordinates
        setMousePos({ x, y });
      }
    } catch (error) {
      console.error("Error in handleMouseMove:", error);
    }
  }
  
  // Handle link click for deletion
  const handleLinkClick = link => {
    if (onDeleteConnection && link.connection_id) {
      if (confirm('Are you sure you want to delete this connection?')) {
        onDeleteConnection(link.connection_id);
      }
    }
  }
  
  // Create gradients for all possible category combinations
  const createGradients = () => {
    const categories = ['art', 'science', 'history', 'music', 'literature', 'philosophy', 'technology', 'hobby', 'general']
    
    return categories.flatMap(cat1 => 
      categories.map(cat2 => (
        <linearGradient 
          key={`${cat1}-${cat2}-gradient`}
          id={`${cat1}-${cat2}-gradient`} 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={getNodeColor(cat1)} stopOpacity="0.8" />
          <stop offset="100%" stopColor={getNodeColor(cat2)} stopOpacity="0.8" />
        </linearGradient>
      ))
    )
  }
  
  // Create patterns for node backgrounds
  const createPatterns = () => {
    const categories = ['art', 'science', 'history', 'music', 'literature', 'philosophy', 'technology', 'hobby', 'general']
    
    return categories.map(category => (
      <pattern 
        key={`${category}-pattern`}
        id={`${category}-pattern`} 
        patternUnits="userSpaceOnUse"
        width="20" 
        height="20"
        patternTransform="rotate(45)"
      >
        <rect width="20" height="20" fill={getNodeColor(category)} fillOpacity="0.1" />
        <line x1="0" y1="0" x2="0" y2="20" stroke={getNodeColor(category)} strokeWidth="1" strokeOpacity="0.2" />
        <line x1="0" y1="0" x2="20" y2="0" stroke={getNodeColor(category)} strokeWidth="1" strokeOpacity="0.2" />
      </pattern>
    ))
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'art': return 'bi-palette'
      case 'science': return 'bi-atom'
      case 'history': return 'bi-hourglass-split'
      case 'music': return 'bi-music-note-beamed'
      case 'literature': return 'bi-book'
      case 'philosophy': return 'bi-lightbulb'
      case 'technology': return 'bi-cpu'
      case 'hobby': return 'bi-controller'
      default: return 'bi-tag'
    }
  }
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Toggle connection mode with 'C' key
      if (event.key === 'c' || event.key === 'C') {
        setConnectionMode(prev => {
          const newMode = !prev;
          if (newMode) {
            toast.info("Connection mode enabled. Click on a node to start creating a connection.");
          } else {
            setSourceNode(null);
            setTempLink(null);
            toast.info("Connection mode disabled");
          }
          return newMode;
        });
      }
      
      // Cancel connection with Escape key
      if (event.key === 'Escape' && connectionMode) {
        setConnectionMode(false);
        setSourceNode(null);
        setTempLink(null);
        toast.info("Connection mode cancelled");
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [connectionMode]);
  
  // Effect to handle mouse move for temporary connection line
  useEffect(() => {
    if (connectionMode) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [connectionMode]);
  
  // Separate effect to update the temporary connection line
  useEffect(() => {
    try {
      // Only proceed if we're in connection mode with a source node and graph ref
      if (!connectionMode || !sourceNode || !graphRef.current) return;
      
      const currentData = graphRef.current.graphData();
      if (!currentData || !Array.isArray(currentData.nodes) || !Array.isArray(currentData.links)) return;
      
      // Remove any existing temporary elements
      const filteredLinks = currentData.links.filter(link => !link.temp);
      const filteredNodes = currentData.nodes.filter(node => node.id !== 'temp-target');
      
      // Create a temporary target node at mouse position
      const tempTarget = { 
        id: 'temp-target',
        x: mousePos.x, 
        y: mousePos.y,
        temp: true
      };
      
      // Add the temporary link
      const tempLink = {
        source: sourceNode.id,
        target: 'temp-target',
        temp: true,
        dashed: true
      };
      
      // Update the graph data
      graphRef.current.graphData({
        nodes: [...filteredNodes, tempTarget],
        links: [...filteredLinks, tempLink]
      });
      
      return () => {
        // Clean up temporary nodes and links
        if (graphRef.current) {
          try {
            const data = graphRef.current.graphData();
            if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
              graphRef.current.graphData({
                nodes: data.nodes.filter(node => !node.temp),
                links: data.links.filter(link => !link.temp)
              });
            }
          } catch (error) {
            console.error("Error cleaning up temp nodes:", error);
          }
        }
      };
    } catch (error) {
      console.error("Error in temporary connection effect:", error);
    }
  }, [connectionMode, sourceNode, mousePos]);

  // Effect to initialize the graph when it's ready
  useEffect(() => {
    // Set a timeout to ensure the graph is ready
    const timer = setTimeout(() => {
      setGraphReady(true);
      console.log("Graph ready state set to true");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Error handling for empty or invalid data
  if (!nodes || nodes.length === 0 || !Array.isArray(nodes) || !Array.isArray(connections)) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center text-white">
          <i className="bi bi-exclamation-triangle text-4xl mb-4"></i>
          <h3 className="text-xl font-medium mb-2">Graph data is not available</h3>
          <p className="text-gray-300">
            {!Array.isArray(nodes) 
              ? "Invalid nodes data format." 
              : !Array.isArray(connections)
                ? "Invalid connections data format."
                : "Add some interest nodes to visualize your knowledge graph."}
          </p>
        </div>
      </div>
    );
  }

  // Show loading state if graph is not ready
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full h-[600px] ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      } rounded-xl shadow-lg overflow-hidden relative`}
    >
      {/* SVG Definitions for gradients and patterns */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {createGradients()}
          {createPatterns()}
          
          {/* Arrow marker definition */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(100, 116, 139, 0.6)" />
          </marker>
          
          <marker
            id="arrow-highlighted"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.9)" />
          </marker>
        </defs>
      </svg>
      
      {/* Controls panel */}
      <div className={`absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700 z-10`}>
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-200 flex items-center">
              <i className="bi bi-sliders mr-2"></i>Graph Controls
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setGraphLayout('cluster')
                  applyLayout('cluster')
                }}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  graphLayout === 'cluster' 
                    ? 'bg-blue-900 text-blue-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="bi bi-diagram-3 mr-1"></i>
                Cluster
              </button>
              
              <button
                onClick={() => {
                  setGraphLayout('force')
                  applyLayout('force')
                }}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  graphLayout === 'force' 
                    ? 'bg-blue-900 text-blue-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="bi bi-stars mr-1"></i>
                Force
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-200 flex items-center">
              <i className="bi bi-toggles mr-2"></i>Display Options
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  showLabels 
                    ? 'bg-blue-900 text-blue-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="bi bi-tag-fill mr-1"></i>
                Labels
              </button>
              
              <button
                onClick={() => setShowArrows(!showArrows)}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  showArrows 
                    ? 'bg-blue-900 text-blue-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="bi bi-arrow-right mr-1"></i>
                Arrows
              </button>
              
              <button
                onClick={() => setHighlightConnections(!highlightConnections)}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  highlightConnections 
                    ? 'bg-blue-900 text-blue-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="bi bi-lightning-fill mr-1"></i>
                Highlight
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  darkMode 
                    ? 'bg-blue-900 text-blue-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'} mr-1`}></i>
                {darkMode ? 'Light' : 'Dark'}
              </button>
              
              <button
                onClick={() => {
                  setConnectionMode(!connectionMode);
                  if (connectionMode) {
                    setSourceNode(null);
                    setTempLink(null);
                    toast.info("Connection mode disabled");
                  } else {
                    toast.info("Connection mode enabled. Click on a node to start creating a connection.");
                  }
                }}
                className={`px-3 py-2 text-xs rounded-md flex items-center justify-center ${
                  connectionMode 
                    ? 'bg-green-800 text-green-200 font-medium' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="bi bi-link-45deg mr-1"></i>
                Connect
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            <div className="flex items-center mb-1">
              <i className="bi bi-info-circle mr-1"></i>
              <span className="font-medium">Tips:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hover over nodes to see connections</li>
              <li>Click nodes to select them</li>
              <li>Click connections to delete them</li>
              <li>Use Connect mode to create new connections</li>
              <li>Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">C</kbd> to toggle connection mode</li>
              <li>Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> to cancel connection</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Navigation controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-700 flex flex-col gap-1">
          <button 
            onClick={() => {
              if (graphRef.current) {
                const currentPosition = graphRef.current.cameraPosition();
                graphRef.current.cameraPosition(
                  { x: currentPosition.x, y: currentPosition.y - 50, z: currentPosition.z },
                  { x: currentPosition.x, y: currentPosition.y - 50, z: currentPosition.z },
                  1000
                );
              }
            }}
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            <i className="bi bi-arrow-up"></i>
          </button>
          
          <div className="flex gap-1">
            <button 
              onClick={() => {
                if (graphRef.current) {
                  const currentPosition = graphRef.current.cameraPosition();
                  graphRef.current.cameraPosition(
                    { x: currentPosition.x - 50, y: currentPosition.y, z: currentPosition.z },
                    { x: currentPosition.x - 50, y: currentPosition.y, z: currentPosition.z },
                    1000
                  );
                }
              }}
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            
            <button 
              onClick={() => {
                if (graphRef.current) {
                  graphRef.current.zoomToFit(400);
                }
              }}
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              <i className="bi bi-fullscreen"></i>
            </button>
            
            <button 
              onClick={() => {
                if (graphRef.current) {
                  const currentPosition = graphRef.current.cameraPosition();
                  graphRef.current.cameraPosition(
                    { x: currentPosition.x + 50, y: currentPosition.y, z: currentPosition.z },
                    { x: currentPosition.x + 50, y: currentPosition.y, z: currentPosition.z },
                    1000
                  );
                }
              }}
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
          
          <button 
            onClick={() => {
              if (graphRef.current) {
                const currentPosition = graphRef.current.cameraPosition();
                graphRef.current.cameraPosition(
                  { x: currentPosition.x, y: currentPosition.y + 50, z: currentPosition.z },
                  { x: currentPosition.x, y: currentPosition.y + 50, z: currentPosition.z },
                  1000
                );
              }
            }}
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            <i className="bi bi-arrow-down"></i>
          </button>
        </div>
        
        <div className="bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-700 flex gap-1">
          <button 
            onClick={() => {
              if (graphRef.current) {
                const currentZoom = graphRef.current.zoom();
                graphRef.current.zoom(currentZoom * 1.2, 1000);
              }
            }}
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
          
          <button 
            onClick={() => {
              if (graphRef.current) {
                const currentZoom = graphRef.current.zoom();
                graphRef.current.zoom(currentZoom * 0.8, 1000);
              }
            }}
            className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            <i className="bi bi-dash-lg"></i>
          </button>
        </div>
      </div>
      
      {/* Connection mode indicator */}
      {connectionMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 right-4 bg-green-800/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-green-700 z-20"
        >
          <div className="flex items-center">
            <i className="bi bi-link-45deg text-white mr-2"></i>
            <span className="text-white text-sm font-medium">
              {sourceNode 
                ? `Select target node to connect with "${sourceNode.name}"` 
                : "Select first node to create connection"}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Info panel for hovered elements */}
      {(hoveredNode || hoveredLink) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-neutral-200 max-w-xs z-10"
        >
          {hoveredNode && (
            <div>
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-${hoveredNode.category === 'general' ? 'gray' : hoveredNode.category}-500`}>
                  <i className={`bi ${getCategoryIcon(hoveredNode.category)} text-white`}></i>
                </div>
                <h3 className="font-medium text-neutral-800">{hoveredNode.name}</h3>
              </div>
              
              <div className="mb-2 flex items-center text-xs text-neutral-500">
                <span className="capitalize">{hoveredNode.category}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(hoveredNode.created_at)}</span>
              </div>
              
              <p className="text-sm text-neutral-700 mb-2">{hoveredNode.description}</p>
              
              {hoveredNode.notes && (
                <div className="bg-neutral-50 p-2 rounded text-xs text-neutral-600 italic">
                  <div className="font-medium mb-1 text-neutral-700 flex items-center">
                    <i className="bi bi-journal-text mr-1"></i> Notes:
                  </div>
                  <p>{hoveredNode.notes}</p>
                </div>
              )}
              
              <div className="mt-2 text-xs text-primary-600">
                Click to view details
              </div>
            </div>
          )}
          
          {hoveredLink && (
            <div>
              <h3 className="font-medium text-neutral-800 text-sm mb-1 flex items-center">
                <i className="bi bi-link-45deg mr-1"></i>
                Connection
              </h3>
              
              <div className="bg-neutral-50 p-2 rounded mb-2">
                <p className="text-sm text-neutral-700">{hoveredLink.description}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <span className="text-neutral-500 mr-1">Strength:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i}
                        className={`bi bi-star-fill text-xs ${
                          i < hoveredLink.value 
                            ? 'text-amber-400' 
                            : 'text-neutral-200'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Loading overlay */}
      {!graphReady && (
        <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900/90' : 'bg-white/80'} flex items-center justify-center`}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className={`w-16 h-16 border-4 ${
                darkMode 
                  ? 'border-blue-900 border-t-blue-500' 
                  : 'border-primary-200 border-t-primary-600'
              } rounded-full animate-spin`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-8 h-8 border-4 ${
                  darkMode 
                    ? 'border-blue-800 border-b-blue-400' 
                    : 'border-primary-300 border-b-primary-500'
                } rounded-full animate-spin`}></div>
              </div>
            </div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-neutral-600'} mt-4 font-medium`}>
              Building your knowledge graph...
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-neutral-500'} text-sm mt-1`}>
              Analyzing {nodes.length} nodes and {connections.length} connections
            </p>
          </div>
        </div>
      )}
      
      {/* Wrap ForceGraph in try-catch */}
      {(() => {
        try {
          return (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
        nodeLabel={node => `${node.name}`}
        nodeColor={node => getNodeColor(node.category)}
        nodeRelSize={8}
        backgroundColor={darkMode ? '#1a1a2e' : null}
        linkWidth={link => {
          if (hoveredLink === link) return 4;
          if (link.temp) return 3;
          return link.value * 0.8;
        }}
        linkCurvature={link => {
          // Check if there's a reverse link
          const hasReverseLink = graphData.links.some(l => 
            (l.source === link.target && l.target === link.source)
          );
          return hasReverseLink ? 0.3 : 0;
        }}
        linkDirectionalArrowLength={showArrows ? 5 : 0}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={link => link.temp ? 5 : 3}
        linkDirectionalParticleSpeed={link => link.temp ? 0.05 : link.value * 0.01}
        linkDirectionalParticleWidth={link => (hoveredLink === link ? 4 : link.value * 0.8)}
        linkDirectionalParticleColor={link => {
          if (hoveredLink === link) return '#ffffff';
          if (link.temp) return 'rgba(74, 222, 128, 0.9)'; // Green particles for temp links
          return 'rgba(255, 255, 255, 0.7)';
        }}
        linkLabel={link => link.description}
        linkColor={link => {
          if (link.temp) return 'rgba(74, 222, 128, 0.6)'; // Green color for temp links
          return getLinkColor(link);
        }}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        onZoomEnd={zoom => setZoomLevel(zoom.k)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const isHovered = node === hoveredNode;
          
          // Calculate node size with potential highlight
          const nodeSize = node.val;
          
          // Draw node glow for hovered nodes
          if (isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize * 1.4, 0, 2 * Math.PI);
            
            // Glow color
            const glowColor = `${getNodeColor(node.category)}33`; // 20% opacity
            
            ctx.fillStyle = glowColor;
            ctx.fill();
          }
          
          // Draw node background pattern
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
          ctx.fillStyle = `url(#${node.category}-pattern)`;
          ctx.fill();
          
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
          ctx.fillStyle = getNodeColor(node.category);
          ctx.fill();
          
          // Draw border
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize + 0.5, 0, 2 * Math.PI);
          ctx.lineWidth = isHovered ? 2 / globalScale : 1.5 / globalScale;
          
          // Border color based on state and mode
          let borderColor;
          if (darkMode) {
            borderColor = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
          } else {
            borderColor = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
          }
          
          ctx.strokeStyle = borderColor;
          ctx.stroke();
          
          // Draw inner circle for visual interest
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize * 0.6, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
          
          // Show connection count indicator
          if (node.connectionCount > 0) {
            // Draw small indicator showing number of connections
            const indicatorSize = nodeSize * 0.5;
            ctx.beginPath();
            ctx.arc(node.x + nodeSize * 0.7, node.y - nodeSize * 0.7, indicatorSize, 0, 2 * Math.PI);
            ctx.fillStyle = darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            ctx.strokeStyle = getNodeColor(node.category);
            ctx.lineWidth = 1 / globalScale;
            ctx.stroke();
            
            // Draw connection count
            ctx.font = `${indicatorSize * 1.2}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = darkMode ? '#ffffff' : getNodeColor(node.category);
            ctx.fillText(node.connectionCount.toString(), node.x + nodeSize * 0.7, node.y - nodeSize * 0.7);
          }
          
          // Only draw labels if zoomed in enough and labels are enabled
          if (globalScale >= 0.7 && showLabels) {
            // Draw text background
            const bgPadding = 2;
            const bgHeight = fontSize + bgPadding * 2;
            const bgWidth = textWidth + bgPadding * 4;
            
            const bgColor = darkMode 
              ? (isHovered ? 'rgba(30, 41, 59, 0.95)' : 'rgba(30, 41, 59, 0.8)')
              : (isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)');
            
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.roundRect(
              node.x - bgWidth / 2,
              node.y + nodeSize + 2,
              bgWidth,
              bgHeight,
              3
            );
            ctx.fill();
            
            // Draw text border
            if (isHovered || isFocused) {
              ctx.strokeStyle = getNodeColor(node.category);
              ctx.lineWidth = 1 / globalScale;
              ctx.beginPath();
              ctx.roundRect(
                node.x - bgWidth / 2,
                node.y + nodeSize + 2,
                bgWidth,
                bgHeight,
                3
              );
              ctx.stroke();
            }
            
            // Draw text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isHovered 
              ? getNodeColor(node.category) 
              : (darkMode ? '#ffffff' : '#333333');
            ctx.fillText(label, node.x, node.y + nodeSize + 2 + bgHeight/2);
            
            // Add a subtle glow effect to make text more readable in dark mode
            if (darkMode) {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
              ctx.shadowBlur = 2;
              ctx.fillText(label, node.x, node.y + nodeSize + 2 + bgHeight/2);
              ctx.shadowBlur = 0;
            }
          }
          
          // Draw category icon in the center of the node
          if (globalScale >= 0.5) {
            const iconSize = nodeSize * 0.8;
            const icon = getCategoryIcon(node.category);
            
            // Map Bootstrap icon names to Unicode characters (simplified approach)
            const iconMap = {
              'bi-palette': '🎨',
              'bi-atom': '⚛️',
              'bi-hourglass-split': '⏳',
              'bi-music-note-beamed': '🎵',
              'bi-book': '📚',
              'bi-lightbulb': '💡',
              'bi-cpu': '🖥️',
              'bi-controller': '🎮',
              'bi-tag': '🏷️'
            };
            
            const iconChar = iconMap[icon] || '•';
            
            ctx.font = `${iconSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(iconChar, node.x, node.y);
            
            // Add a subtle glow effect to make icons more visible
            if (darkMode) {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
              ctx.shadowBlur = 3;
              ctx.fillText(iconChar, node.x, node.y);
              ctx.shadowBlur = 0;
            }
          }
        }}
        linkCanvasObject={(link, ctx, globalScale) => {
          if (!showArrows) return;
          
          const start = link.source;
          const end = link.target;
          
          if (!start || !end || typeof start !== 'object' || typeof end !== 'object') return;
          
          // Calculate the direction vector
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          
          // Calculate the length of the vector
          const length = Math.sqrt(dx * dx + dy * dy);
          
          // Normalize the vector
          const ndx = dx / length;
          const ndy = dy / length;
          
          // Calculate the position of the arrow
          const startNodeSize = start.val;
          const endNodeSize = end.val;
          
          // Position the arrow at the edge of the target node
          const arrowX = end.x - ndx * endNodeSize;
          const arrowY = end.y - ndy * endNodeSize;
          
          // Draw the arrow
          const arrowSize = 4 / globalScale;
          const arrowAngle = Math.atan2(dy, dx);
          
          ctx.save();
          ctx.translate(arrowX, arrowY);
          ctx.rotate(arrowAngle);
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-arrowSize, arrowSize / 2);
          ctx.lineTo(-arrowSize, -arrowSize / 2);
          ctx.closePath();
          
          // Fill with gradient or solid color
          if (link === hoveredLink) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          } else {
            const sourceColor = getNodeColor(start.category);
            const targetColor = getNodeColor(end.category);
            
            const gradient = ctx.createLinearGradient(-arrowSize, 0, 0, 0);
            gradient.addColorStop(0, sourceColor);
            gradient.addColorStop(1, targetColor);
            
            ctx.fillStyle = gradient;
          }
          
          ctx.fill();
          ctx.restore();
        }}
        linkLineDash={link => (link.dashed || link.temp) ? [5, 5] : null}
            />
          );
        } catch (error) {
          console.error("Error rendering ForceGraph:", error);
          return (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <i className="bi bi-exclamation-triangle text-4xl mb-4"></i>
                <h3 className="text-xl font-medium mb-2">Error rendering graph</h3>
                <p className="text-gray-300">{error.message}</p>
              </div>
            </div>
          );
        }
      })()}
    </motion.div>
  )
}

export default GraphView
