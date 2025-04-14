import React from 'react';

const BasicGraphView = ({ nodes, connections }) => {
  // Get color based on category
  const getNodeColor = (category) => {
    switch (category) {
      case 'art': return '#f43f5e' // rose-500
      case 'science': return '#3b82f6' // blue-500
      case 'history': return '#f59e0b' // amber-500
      case 'music': return '#a855f7' // purple-500
      case 'literature': return '#10b981' // emerald-500
      case 'philosophy': return '#6366f1' // indigo-500
      case 'technology': return '#06b6d4' // cyan-500
      case 'hobby': return '#ec4899' // pink-500
      default: return '#6b7280' // gray-500
    }
  };

  // Validate input data
  if (!Array.isArray(nodes) || !Array.isArray(connections)) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center text-white">
          <i className="bi bi-exclamation-triangle text-4xl mb-4"></i>
          <h3 className="text-xl font-medium mb-2">Invalid data format</h3>
          <p className="text-gray-300">
            {!Array.isArray(nodes)
              ? "Invalid nodes data format."
              : "Invalid connections data format."}
          </p>
        </div>
      </div>
    );
  }

  // Show message if no nodes
  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center text-white">
          <i className="bi bi-diagram-2 text-4xl mb-4"></i>
          <h3 className="text-xl font-medium mb-2">No nodes to display</h3>
          <p className="text-gray-300">Add some interest nodes to visualize your knowledge graph.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-gray-900 to-slate-900 rounded-xl shadow-lg p-8 overflow-auto">
      <h2 className="text-white text-xl font-bold mb-4">Knowledge Graph</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white">
        {nodes.map(node => {
          // Calculate connection count for this node
          const nodeConnectionCount = connections.filter(conn =>
            conn.source_node_id === node.id || conn.target_node_id === node.id
          ).length;

          return (
            <div
              key={node.id}
              className="p-4 rounded-lg border border-opacity-30 transition-all hover:scale-105"
              style={{
                backgroundColor: `${getNodeColor(node.category)}20`,
                borderColor: getNodeColor(node.category)
              }}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{node.title}</h3>
                <span className="bg-gray-800 px-2 py-1 rounded-full text-xs">
                  {nodeConnectionCount === 1 ? '1 connection' : `${nodeConnectionCount} connections`}
                </span>
              </div>
              <p className="text-sm opacity-80 mt-1">{node.category}</p>
              <p className="text-xs text-gray-300 mt-2 line-clamp-2">{node.description}</p>
            </div>
          );
        })}
      </div>

      {connections.length > 0 && (
        <div className="mt-8 bg-gray-800 bg-opacity-50 p-4 rounded-lg">
          <h3 className="text-white text-lg font-medium mb-2">Connections:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {connections.map(conn => {
              const sourceNode = nodes.find(n => n.id === conn.source_node_id);
              const targetNode = nodes.find(n => n.id === conn.target_node_id);

              if (!sourceNode || !targetNode) return null;

              return (
                <div key={conn.id} className="bg-gray-700 bg-opacity-30 p-3 rounded border border-gray-600">
                  <div className="flex items-center text-sm">
                    <span className="font-medium" style={{color: getNodeColor(sourceNode.category)}}>
                      {sourceNode.title}
                    </span>
                    <i className="bi bi-arrow-right mx-2 text-gray-400"></i>
                    <span className="font-medium" style={{color: getNodeColor(targetNode.category)}}>
                      {targetNode.title}
                    </span>
                  </div>
                  {conn.description && (
                    <p className="text-xs text-gray-300 mt-1">{conn.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicGraphView;