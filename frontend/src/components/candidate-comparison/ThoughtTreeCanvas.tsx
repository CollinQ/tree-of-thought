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
            <div 
              key={`connection-${fromNode.id}-${toNode.id}`} 
              style={style}
              className="pointer-events-none"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ThoughtTreeCanvas; 