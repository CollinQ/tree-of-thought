import React, { useState, useMemo, useEffect } from 'react';
import { ThoughtNode } from '../../types';

// Define rainbow colors for different levels
const levelColors = [
  { // Level 0 (Root)
    background: '#e0f2fe',
    border: '#7dd3fc',
    text: '#0369a1',
  },
  { // Level 1
    background: '#fcf0f2',
    border: '#fda4af',
    text: '#be123c',
  },
  { // Level 2
    background: '#fef3c7',
    border: '#fbbf24',
    text: '#b45309',
  },
  { // Level 3
    background: '#dcfce7',
    border: '#86efac',
    text: '#15803d',
  },
  { // Level 4
    background: '#dbeafe',
    border: '#93c5fd',
    text: '#1e40af',
  },
  { // Level 5
    background: '#f3e8ff',
    border: '#d8b4fe',
    text: '#7e22ce',
  },
  { // Level 6
    background: '#ffedd5',
    border: '#fb923c',
    text: '#c2410c',
  },
];

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
  },
  'root': {
    background: '#e0f2fe',
    border: '#7dd3fc',
    text: '#0369a1',
    line: '#0ea5e9'
  },
  'thought': {
    background: '#f0fdf4',
    border: '#bbf7d0',
    text: '#166534',
    line: '#22c55e'
  }
};

interface ThoughtTreeCanvasProps {
  thoughts: ThoughtNode[];
  currentThoughtIndex: number;
}

// Add this debug function at the top of the file (outside the component)
function logThoughtTree(thoughts: ThoughtNode[]) {
  console.debug("==== THOUGHT TREE DEBUG ====");
  console.debug(`Total nodes: ${thoughts.length}`);
  
  thoughts.forEach(node => {
    console.debug(`Node ${node.id} (Level ${node.level}): ${node.text.substring(0, 30)}...`);
    console.debug(`  Children: ${node.children ? node.children.join(', ') : 'none'}`);
  });
  
  console.debug("==== END THOUGHT TREE DEBUG ====");
}

// Get color based on level (rainbow colors)
const getLevelColor = (level: number, element: 'background' | 'border' | 'text') => {
  // Make sure level is within bounds of our levelColors array
  const safeLevel = Math.min(level, levelColors.length - 1);
  return levelColors[safeLevel][element];
};

const getTypeColor = (type: string, element: 'background' | 'border' | 'text' | 'line') => {
  // Default colors for all types
  const defaultColors = {
    background: '#f0f4f8',
    border: '#cbd5e0',
    text: '#2d3748',
    line: '#4285F4'
  };
  
  if (!type || !typeColors[type]) {
    return defaultColors[element];
  }
  
  return typeColors[type][element] || defaultColors[element];
};

// Add this improved positioning function
const getOptimalPopupPosition = (thought: ThoughtNode, containerWidth: number, containerHeight: number) => {
  // Default position (centered below the node)
  let position = {
    left: `${thought.x * 100}%`,
    top: `${thought.y * 100 + 5}%`,
    transform: 'translate(-50%, 0)',
  };
  
  // For nodes near the bottom (level 3+), position the popup above
  if (thought.y > 0.7) {
    position = {
      left: `${thought.x * 100}%`,
      top: `${thought.y * 100 - 5}%`,
      transform: 'translate(-50%, -100%)',
    };
  }
  
  // For nodes near the left edge, position the popup to the right
  if (thought.x < 0.15) {
    position = {
      left: `${thought.x * 100 + 5}%`,
      top: `${thought.y * 100}%`,
      transform: 'translate(0, -50%)',
    };
  }
  
  // For nodes near the right edge, position the popup to the left
  if (thought.x > 0.85) {
    position = {
      left: `${thought.x * 100 - 5}%`,
      top: `${thought.y * 100}%`,
      transform: 'translate(-100%, -50%)',
    };
  }
  
  // Special case for bottom-left corner
  if (thought.y > 0.7 && thought.x < 0.15) {
    position = {
      left: `${thought.x * 100 + 5}%`,
      top: `${thought.y * 100 - 5}%`,
      transform: 'translate(0, -100%)',
    };
  }
  
  // Special case for bottom-right corner
  if (thought.y > 0.7 && thought.x > 0.85) {
    position = {
      left: `${thought.x * 100 - 5}%`,
      top: `${thought.y * 100 - 5}%`,
      transform: 'translate(-100%, -100%)',
    };
  }
  
  return position;
};

export const ThoughtTreeCanvas: React.FC<ThoughtTreeCanvasProps> = ({
  thoughts, 
  currentThoughtIndex,
}) => {
  // Log the entire thought tree for debugging
  useEffect(() => {
    if (thoughts && thoughts.length > 0) {
      logThoughtTree(thoughts);
      console.debug("Current thought index:", currentThoughtIndex);
    }
  }, [thoughts, currentThoughtIndex]);

  const [hoveredThought, setHoveredThought] = useState<ThoughtNode | null>(null);
  
  // Position thoughts in a tree layout - with increased spacing
  const visibleThoughts = useMemo(() => {
    if (!thoughts || thoughts.length === 0) return [];
    
    return thoughts.map((thought) => {
      const level = thought.level;
      const levelThoughts = thoughts.filter(t => t.level === level);
      const levelIndex = levelThoughts.findIndex(t => t.id === thought.id);
      const levelCount = levelThoughts.length;
      
      // Calculate x position
      let x = 0.5; // Default to center
      if (level === 0) {
        x = 0.5; // Center the root
      } else {
        // Wider distribution
        const totalWidth = 0.85; // Increased from 0.8
        const startX = 0.075; // Adjusted from 0.1
        
        if (levelCount === 1) {
          x = 0.5;
        } else {
          const step = totalWidth / (levelCount - 1 || 1);
          x = startX + (levelIndex * step);
        }
      }
      
      // Calculate y position with more vertical spacing
      const y = 0.08 + (level * 0.23); // Increased from 0.1 + (level * 0.2)
      
      return { ...thought, x, y };
    });
  }, [thoughts]);
  
  // Build connections based on the children arrays
  const connections = useMemo(() => {
    if (!visibleThoughts || visibleThoughts.length === 0) return [];
    
    console.debug("Building connections, visibleThoughts:", visibleThoughts.length);
    const result: { from: ThoughtNode; to: ThoughtNode }[] = [];
    
    // Create a map for efficient lookup
    const thoughtMap = new Map<number, ThoughtNode>();
    visibleThoughts.forEach(thought => {
      thoughtMap.set(thought.id, thought);
    });
    
    // For each node, find its children and create connections
    visibleThoughts.forEach(fromNode => {
      if (!fromNode.children || fromNode.children.length === 0) return;
      
      fromNode.children.forEach(childId => {
        const toNode = thoughtMap.get(childId);
        if (toNode) {
          // Add the connection if both nodes are visible based on currentThoughtIndex
          // Get indexes in the visibleThoughts array
          const fromIndex = visibleThoughts.findIndex(t => t.id === fromNode.id);
          const toIndex = visibleThoughts.findIndex(t => t.id === toNode.id);
          
          if (fromIndex <= currentThoughtIndex && toIndex <= currentThoughtIndex) {
            result.push({ from: fromNode, to: toNode });
          }
        }
      });
    });
    
    console.debug(`Created ${result.length} connections`);
    return result;
  }, [visibleThoughts, currentThoughtIndex]);
  
  // Determine which thoughts should be visible at the current index
  const displayedThoughts = useMemo(() => {
    return visibleThoughts.filter((_, index) => index <= currentThoughtIndex);
  }, [visibleThoughts, currentThoughtIndex]);
  
  // Add ref to get container dimensions
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '650px' }} ref={containerRef}>
      {/* Small debug info in the corner */}
      <div className="absolute top-0 left-0 bg-white p-1 text-xs z-50 opacity-70 rounded">
        Nodes: {displayedThoughts.length}/{visibleThoughts.length}, Index: {currentThoughtIndex}
      </div>
      
      {/* Fixed card-style hover popup in top right corner */}
      {hoveredThought && (
        <div
          className="fixed top-4 right-4 bg-white rounded-lg border shadow-xl z-[9999] pointer-events-none"
          style={{
            width: '350px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '14px',
            borderColor: getLevelColor(hoveredThought.level, 'border'),
            borderWidth: '2px',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="font-medium mb-1">
              <span 
                className="inline-block px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: getLevelColor(hoveredThought.level, 'background'),
                  color: getLevelColor(hoveredThought.level, 'text'),
                  borderWidth: '1px',
                  borderColor: getLevelColor(hoveredThought.level, 'border'),
                }}
              >
                {hoveredThought.type || (hoveredThought.level === 0 ? 'Root' : 'Thought')}
              </span>
              <span className="ml-2 text-xs text-gray-500">ID: {hoveredThought.id}</span>
            </div>
            <div className="text-xs text-gray-500">Level: {hoveredThought.level}</div>
          </div>
          <div className="text-sm whitespace-pre-wrap" style={{ lineHeight: '1.4' }}>
            {hoveredThought.fullText || hoveredThought.text}
          </div>
        </div>
      )}

      {/* Render the SVG connections */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ overflow: 'visible' }}
      >
        {connections.map((connection, index) => {
          const { from, to } = connection;
          
          return (
            <line 
              key={`connection-${index}`}
              x1={`${from.x * 100}%`}
              y1={`${from.y * 100}%`}
              x2={`${to.x * 100}%`}
              y2={`${to.y * 100}%`}
              stroke="#4285F4" // Keep all connection lines the same color
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Render the thought nodes with rainbow colors based on level */}
      {displayedThoughts.map((thought) => {
        const isHovered = hoveredThought?.id === thought.id;

        const style = {
          left: `${thought.x * 100}%`,
          top: `${thought.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: getLevelColor(thought.level, 'background'),
          borderColor: getLevelColor(thought.level, 'border'),
          color: getLevelColor(thought.level, 'text'),
          opacity: 1,
          transition: 'opacity 0.3s ease-in-out, box-shadow 0.2s ease-in-out',
          maxWidth: '160px',
          width: 'fit-content',
          minHeight: '70px',
          // Highlight the currently hovered node
          boxShadow: isHovered ? '0 0 0 2px #4285F4, 0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
        };
        
        return (
          <div
            key={`thought-${thought.id}`}
            className="absolute p-3 rounded-lg border shadow-md z-10"
            style={style}
            onMouseEnter={() => setHoveredThought(thought)}
            onMouseLeave={() => setHoveredThought(null)}
          >
            <div className={`text-sm relative ${isHovered ? 'font-medium' : ''}`}>
              {thought.text.length > 35 ? `${thought.text.substring(0, 35)}...` : thought.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ThoughtTreeCanvas; 