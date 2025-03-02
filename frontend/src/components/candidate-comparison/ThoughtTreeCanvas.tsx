import React, { useState, useMemo } from 'react';
import { ThoughtNode } from '../../types';

// Define typeColors directly in this file instead of importing
const typeColors = {
  'job_requirements': {
    background: '#f0f9ff',
    border: '#bae6fd',
    text: '#0369a1',
    line: '#0ea5e9'
  },
  'candidate_evaluation': {
    background: '#f0fdf4',
    border: '#bbf7d0',
    text: '#166534',
    line: '#22c55e'
  },
  'comparison': {
    background: '#fdf4ff',
    border: '#f5d0fe',
    text: '#86198f',
    line: '#d946ef'
  },
  'decision': {
    background: '#fff7ed',
    border: '#fed7aa',
    text: '#9a3412',
    line: '#f97316'
  },
  'default': {
    background: '#f0f4f8',
    border: '#cbd5e0',
    text: '#2d3748',
    line: '#4285F4'
  }
};

interface ThoughtTreeCanvasProps {
  thoughts: ThoughtNode[];
  currentThoughtIndex: number;
}

const getTypeColor = (type: string, element: 'background' | 'border' | 'text' | 'line', colors: Record<string, any>) => {
  const defaultColors = {
    background: '#f0f4f8',
    border: '#cbd5e0',
    text: '#2d3748',
    line: '#4285F4'
  };
  
  if (!colors || !colors[type]) {
    return defaultColors[element];
  }
  
  return colors[type][element] || defaultColors[element];
};

export const ThoughtTreeCanvas: React.FC<ThoughtTreeCanvasProps> = ({
  thoughts,
  currentThoughtIndex,
}) => {
  const [hoveredThought, setHoveredThought] = useState<ThoughtNode | null>(null);

  // Position thoughts in a tree layout
  const visibleThoughts = useMemo(() => {
    console.debug("Positioning thoughts:", thoughts.length);
    
    if (!thoughts || thoughts.length === 0) {
      return [];
    }

    // Determine the levels in the tree
    const levels = [...new Set(thoughts.map(t => t.level))].sort((a, b) => a - b);
    console.debug("Detected levels:", levels);
    
    // Count thoughts per level
    const thoughtsPerLevel: Record<number, number> = {};
    levels.forEach(level => {
      thoughtsPerLevel[level] = thoughts.filter(t => t.level === level).length;
    });
    console.debug("Thoughts per level:", thoughtsPerLevel);
    
    // Position each thought
    return thoughts.map((thought, index) => {
      const level = thought.level;
      const levelCount = thoughtsPerLevel[level];
      const levelThoughts = thoughts.filter(t => t.level === level);
      const levelIndex = levelThoughts.findIndex(t => t.id === thought.id);
      
      // Calculate x position based on level index
      // For level 0 (root), center it
      // For other levels, distribute evenly
      let x = 0.5; // Default to center
      if (level === 0) {
        x = 0.5; // Center the root
      } else {
        // Distribute nodes evenly across the width
        // Add some padding on the sides
        const padding = 0.1;
        const availableWidth = 1 - (2 * padding);
        const step = levelCount > 1 ? availableWidth / (levelCount - 1) : 0;
        x = padding + (levelIndex * step);
        
        // For levels with only one node, center it
        if (levelCount === 1) {
          x = 0.5;
        }
      }
      
      // Calculate y position based on level
      // Distribute levels evenly down the canvas
      const y = 0.2 + (level * 0.2); // Start at 20% from top, each level adds 20%
      
      return {
        ...thought,
        x,
        y,
      };
    });
  }, [thoughts]);

  // Create connections between nodes
  const connections = useMemo(() => {
    console.debug("Building connections");
    
    if (!Array.isArray(visibleThoughts)) return [];
    
    const allConnections: { from: ThoughtNode; to: ThoughtNode }[] = [];
    
    // Log all nodes and their children
    visibleThoughts.forEach(node => {
      console.debug(`Node ${node.id} (level ${node.level}) has children:`, node.children);
    });
    
    // For each node, find its children and create connections
    visibleThoughts.forEach(fromNode => {
      // Skip nodes without children
      if (!fromNode.children || !Array.isArray(fromNode.children) || fromNode.children.length === 0) {
        return;
      }
      
      // For each child ID, find the corresponding node
      fromNode.children.forEach(childId => {
        const toNode = visibleThoughts.find(node => node.id === childId);
        
        if (toNode) {
          // Only include connections for nodes that are visible based on currentThoughtIndex
          const fromIndex = visibleThoughts.findIndex(node => node.id === fromNode.id);
          const toIndex = visibleThoughts.findIndex(node => node.id === toNode.id);
          
          if (fromIndex <= currentThoughtIndex && toIndex <= currentThoughtIndex) {
            allConnections.push({ from: fromNode, to: toNode });
            console.debug(`Added connection: ${fromNode.id} -> ${toNode.id}`);
          }
        } else {
          console.debug(`Child node with ID ${childId} not found for parent ${fromNode.id}`);
        }
      });
    });
    
    console.debug("Final connections:", {
      count: allConnections.length,
      connections: allConnections.map(c => `${c.from.id} -> ${c.to.id}`)
    });
    
    return allConnections;
  }, [visibleThoughts, currentThoughtIndex]);

  console.debug("ThoughtTreeCanvas rendering with:", {
    thoughtsCount: thoughts.length,
    visibleThoughtsCount: visibleThoughts.length,
    currentThoughtIndex,
    hasPositioning: visibleThoughts.length > 0 && visibleThoughts[0].x !== undefined,
    connectionsCount: connections.length
  });

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      {/* Render the thought nodes */}
      {visibleThoughts.map((thought, index) => {
        const isVisible = index <= currentThoughtIndex;
        if (!isVisible) return null;

        const isHovered = hoveredThought?.id === thought.id;

        const style = {
          left: `${thought.x * 100}%`,
          top: `${thought.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: getTypeColor(thought.type, 'background', typeColors),
          borderColor: getTypeColor(thought.type, 'border', typeColors),
          color: getTypeColor(thought.type, 'text', typeColors),
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        };

        return (
          <div
            key={`thought-${thought.id}`}
            className="absolute p-3 rounded-lg border shadow-md max-w-xs z-10"
            style={style}
            onMouseEnter={() => setHoveredThought(thought)}
            onMouseLeave={() => setHoveredThought(null)}
          >
            <div className={`text-sm relative ${isHovered ? 'font-medium' : ''}`}>
              {thought.text}
            </div>
          </div>
        );
      })}

      {/* Render the SVG connections */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ overflow: 'visible' }}
      >
        {connections.map((connection, index) => {
          const { from, to } = connection;
          
          // Debug each connection
          console.debug(`Connection ${index}: ${from.id} -> ${to.id}`, {
            isRootConnection: from.id === 0,
            fromLevel: from.level,
            toLevel: to.level,
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            fromXPercent: `${from.x * 100}%`,
            fromYPercent: `${from.y * 100}%`,
            toXPercent: `${to.x * 100}%`,
            toYPercent: `${to.y * 100}%`
          });
          
          return (
            <line 
              key={`connection-${index}`}
              x1={`${from.x * 100}%`}
              y1={`${from.y * 100}%`}
              x2={`${to.x * 100}%`}
              y2={`${to.y * 100}%`}
              stroke="#4285F4"
              strokeWidth="2"
              strokeOpacity="1"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ThoughtTreeCanvas; 