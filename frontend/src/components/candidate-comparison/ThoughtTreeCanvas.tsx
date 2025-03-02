import React, { useState, useMemo, useEffect } from 'react';
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

// Add this debug function at the top of the file (outside the component)
function logThoughtTree(thoughts: ThoughtNode[]) {
  console.debug("==== THOUGHT TREE DEBUG ====");
  console.debug(`Total nodes: ${thoughts.length}`);
  
  thoughts.forEach(node => {
    console.debug(`Node ${node.id} (Level ${node.level}): ${node.text.substring(0, 30)}...`);
    console.debug(`  Children: ${node.children.join(', ')}`);
  });
  
  console.debug("==== END THOUGHT TREE DEBUG ====");
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

// Update the popup positioning logic to position closer to the node
const getPopupPosition = (thought: ThoughtNode) => {
  // Default is directly below the node with minimal gap
  let position = {
    left: `${thought.x * 100}%`,
    top: `${thought.y * 100 + 5}%`, // Reduced gap to 5%
    transform: 'translate(-50%, 0)',
  };
  
  // For nodes at the bottom (level 3+), position the popup above with minimal gap
  if (thought.level >= 3) {
    position = {
      left: `${thought.x * 100}%`,
      top: `${thought.y * 100 - 5}%`, // Reduced gap to 5%
      transform: 'translate(-50%, -100%)',
    };
  }
  
  // For nodes on the left edge (x < 0.2), position to the right with minimal gap
  if (thought.x < 0.2) {
    position = {
      left: `${thought.x * 100 + 3}%`, // Reduced gap to 3%
      top: `${thought.y * 100}%`,
      transform: 'translate(0, -50%)',
    };
  }
  
  // For nodes on the right edge (x > 0.8), position to the left with minimal gap
  if (thought.x > 0.8) {
    position = {
      left: `${thought.x * 100 - 3}%`, // Reduced gap to 3%
      top: `${thought.y * 100}%`,
      transform: 'translate(-100%, -50%)',
    };
  }
  
  // Determine if we should use fixed positioning (for edge cases)
  const useFixed = (thought.y > 0.8) || (thought.x < 0.1) || (thought.x > 0.9);
  
  return { position, useFixed };
};

// Alternative implementation using only HTML elements
export const ThoughtTreeCanvas: React.FC<ThoughtTreeCanvasProps> = ({
  thoughts,
  currentThoughtIndex,
}) => {
  const [hoveredThought, setHoveredThought] = useState<ThoughtNode | null>(null);
  
  // Position thoughts in a tree layout
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
        // Simple distribution
        const totalWidth = 0.8;
        const startX = 0.1;
        
        if (levelCount === 1) {
          x = 0.5;
        } else {
          const step = totalWidth / (levelCount - 1 || 1);
          x = startX + (levelIndex * step);
        }
      }
      
      // Calculate y position
      const y = 0.1 + (level * 0.2);
      
      return { ...thought, x, y };
    });
  }, [thoughts]);
  
  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px', border: '1px dashed #ccc' }}>
      {/* Render connections as HTML divs */}
      {visibleThoughts.map(fromNode => {
        if (!fromNode.children || fromNode.children.length === 0) return null;
        
        return fromNode.children.map(childId => {
          const toNode = visibleThoughts.find(node => node.id === childId);
          if (!toNode) return null;
          
          // Calculate the line length and angle
          const fromX = fromNode.x * 100;
          const fromY = fromNode.y * 100;
          const toX = toNode.x * 100;
          const toY = toNode.y * 100;
          
          const dx = toX - fromX;
          const dy = toY - fromY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          const style = {
            position: 'absolute' as const,
            left: `${fromX}%`,
            top: `${fromY}%`,
            width: `${length}%`,
            height: '2px',
            backgroundColor: '#4285F4',
            transformOrigin: '0 0',
            transform: `rotate(${angle}deg)`,
            zIndex: 0,
          };
          
          return (
            <div 
              key={`connection-${fromNode.id}-${toNode.id}`} 
              style={style}
              className="pointer-events-none"
            />
          );
        });
      })}
      
      {/* Render nodes */}
      {visibleThoughts.map((thought) => {
        const style = {
          position: 'absolute' as const,
          left: `${thought.x * 100}%`,
          top: `${thought.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: thought.type === 'root' ? '#e0f2fe' : '#f0fdf4',
          borderColor: thought.type === 'root' ? '#7dd3fc' : '#bbf7d0',
          color: thought.type === 'root' ? '#0369a1' : '#166534',
          maxWidth: '180px',
          minHeight: '60px',
          zIndex: 1000,
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        };
        
        return (
          <div
            key={`node-${thought.id}`}
            style={style}
            onMouseEnter={() => setHoveredThought(thought)}
            onMouseLeave={() => setHoveredThought(null)}
          >
            <div className="absolute top-0 right-0 bg-gray-200 text-xs px-1 rounded-bl">
              {thought.id}
            </div>
            <div className="text-sm">
              {thought.text.length > 40 ? `${thought.text.substring(0, 40)}...` : thought.text}
            </div>
          </div>
        );
      })}
      
      {/* Hover popup */}
      {hoveredThought && (
        <div
          style={{
            position: 'absolute',
            left: `${hoveredThought.x * 100}%`,
            top: `${hoveredThought.y * 100 + 5}%`,
            transform: 'translate(-50%, 0)',
            maxWidth: '400px',
            backgroundColor: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '12px',
            zIndex: 9999,
          }}
        >
          <div className="text-sm font-medium mb-2">
            {hoveredThought.type || 'Thought'} (ID: {hoveredThought.id})
          </div>
          <div className="text-sm">
            {hoveredThought.fullText || hoveredThought.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtTreeCanvas; 