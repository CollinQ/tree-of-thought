import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { ThoughtNode, TypeColors } from './types';

interface ThoughtTreeCanvasProps {
  thoughts: ThoughtNode[];
  currentThoughtIndex: number;
  typeColors: TypeColors;
  jobDescription?: string;
}

/**
 * ThoughtTreeCanvas component displays the thought tree visualization
 */
const ThoughtTreeCanvas: React.FC<ThoughtTreeCanvasProps> = ({ 
  thoughts, 
  currentThoughtIndex,
  typeColors,
  jobDescription
}) => {
  const [hoveredThought, setHoveredThought] = useState<ThoughtNode | null>(null);
  const [hoveredJobTitle, setHoveredJobTitle] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Add a function to position thought nodes in the visualization
  const getPositionedThoughts = useMemo(() => {
    if (!Array.isArray(thoughts) || thoughts.length === 0) {
      console.debug("No thoughts to position");
      return [];
    }
    
    console.debug("Positioning thoughts:", thoughts.length);
    
    // Find all unique levels
    const levels = Array.from(new Set(thoughts.map(t => t.level))).sort();
    console.debug("Detected levels:", levels);
    
    // Count thoughts per level
    const thoughtsPerLevel = levels.reduce((acc, level) => {
      acc[level] = thoughts.filter(t => t.level === level).length;
      return acc;
    }, {} as Record<number, number>);
    
    console.debug("Thoughts per level:", thoughtsPerLevel);
    
    // Position each thought with x,y coordinates and add parent/child connections
    return thoughts.map((thought, idx) => {
      const level = thought.level || 1;
      const levelIndex = levels.indexOf(level);
      const levelCount = thoughtsPerLevel[level];
      
      // Calculate vertical position based on level
      const y = (levelIndex + 1) / (levels.length + 1);
      
      // Find thought's position within its level
      const thoughtsInSameLevel = thoughts.filter(t => t.level === level);
      const positionInLevel = thoughtsInSameLevel.findIndex(t => t.id === thought.id);
      
      // Calculate horizontal position 
      const x = (positionInLevel + 1) / (levelCount + 1);
      
      // Determine children (thoughts in next level that reference this thought)
      const children = [];
      if (levelIndex < levels.length - 1) {
        const nextLevel = levels[levelIndex + 1];
        const nextLevelThoughts = thoughts.filter(t => t.level === nextLevel);
        
        // Logic to determine which thoughts are children
        // For simplicity, connect to thoughts that share candidateA/B references
        const isChildConnected = (potentialChild: ThoughtNode) => {
          // Connect if they refer to the same candidate
          return (thought.candidateA && potentialChild.candidateA) || 
                 (thought.candidateB && potentialChild.candidateB);
        };
        
        children.push(...nextLevelThoughts
          .filter(isChildConnected)
          .map(t => thoughts.findIndex(th => th.id === t.id))
        );
      }
      
      return {
        ...thought,
        x,
        y,
        children,
        text: thought.content
      };
    });
  }, [thoughts]);

  // Replace visibleThoughts with a filtered version of positioned thoughts
  const visibleThoughts = useMemo(() => {
    return getPositionedThoughts.slice(0, currentThoughtIndex + 1);
  }, [getPositionedThoughts, currentThoughtIndex]);

  // Add a safety check for visibleThoughts
  const connections = Array.isArray(visibleThoughts) 
    ? visibleThoughts.flatMap((thought: ThoughtNode) => {
        // Check if thought exists and has a children property
        if (!thought || !thought.children || !Array.isArray(thought.children)) {
          console.debug("Skipping thought with missing or invalid children:", thought);
          return [];
        }
      
        return thought.children
          // Filter children that should be visible based on currentThoughtIndex
          .filter((childId: number) => {
            if (!Array.isArray(thoughts)) {
              console.debug("thoughts array is not valid:", thoughts);
              return false;
            }
            
            // Find the child thought by ID
            const childThought = thoughts.find((t: ThoughtNode) => t && t.id === childId);
            if (!childThought) return false;
            
            // Get the index of the child in the original thoughts array
            const childIndex = thoughts.indexOf(childThought);
            
            // Only return true if the child exists and is within the current visible range
            return childIndex !== -1 && childIndex <= currentThoughtIndex;
          })
          // Map each child ID to a connection object
          .map((childId: number) => {
            if (!Array.isArray(thoughts)) return null;
            
            const childThought = thoughts.find((t: ThoughtNode) => t && t.id === childId);
            if (!childThought) {
              console.debug("Could not find child with ID:", childId);
              return null;
            }
            return { from: thought, to: childThought };
          })
          // Filter out null connections
          .filter((conn): conn is { from: ThoughtNode; to: ThoughtNode } => conn !== null);
      })
    : [];

  // Add debug logging
  console.debug("Building connections:", {
    visibleThoughtsCount: Array.isArray(visibleThoughts) ? visibleThoughts.length : 0,
    connectionsCount: connections.length,
    currentThoughtIndex
  });

  // Generate thought detail content for hovering
  const getThoughtDetail = (thought: ThoughtNode) => {
    // Use fullText if available, otherwise use text
    const displayText = thought.fullText || thought.text;
    return (
      <div className="text-sm">
        <div className="font-semibold mb-2 pb-1 border-b border-gray-100">
          {thought.type 
            ? `${thought.type.charAt(0).toUpperCase() + thought.type.slice(1)} Thought` 
            : "Evaluation Thought"}
        </div>
        <div className="leading-relaxed">{displayText}</div>
        
        {/* Add some contextual information based on the thought type */}
        {thought.type === 'jenny' && (
          <div className="mt-2 text-xs bg-green-50 p-2 rounded text-green-700">
            Evaluating candidate A's specific qualifications and experience
          </div>
        )}
        {thought.type === 'radostin' && (
          <div className="mt-2 text-xs bg-purple-50 p-2 rounded text-purple-700">
            Evaluating candidate B's specific qualifications and experience
          </div>
        )}
      </div>
    );
  };

  // Add extensive debug logging
  useEffect(() => {
    console.debug("ThoughtTreeCanvas rendering with:", {
      thoughtsCount: thoughts?.length || 0,
      visibleThoughtsCount: visibleThoughts?.length || 0,
      currentThoughtIndex,
      hasPositioning: thoughts.some(t => t.x !== undefined && t.y !== undefined),
      connectionsCount: connections?.length || 0,
    });
  }, [thoughts, visibleThoughts, currentThoughtIndex, connections]);

  return (
    <div 
      className="relative rounded-xl bg-white p-4 shadow-lg overflow-visible h-[900px]" 
      ref={containerRef}
    >
      {/* <div className="absolute top-4 left-4 text-sm font-medium bg-white/80 backdrop-blur-sm p-2 rounded-lg z-20">
        <div className="mb-2 font-bold">Thought Types</div>
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: color.line }}
            ></div>
            <div>{type.charAt(0).toUpperCase() + type.slice(1)}</div>
          </div>
        ))}
      </div> */}

      {jobDescription && (
        <div 
          className="absolute top-4 right-4 z-10 cursor-pointer"
          onMouseEnter={() => setHoveredJobTitle(true)}
          onMouseLeave={() => setHoveredJobTitle(false)}
        >
          <h3 className="text-amber-800 font-semibold flex items-center px-3 py-2 bg-amber-50 rounded-lg shadow-sm border border-amber-200">
            <span className="text-amber-600 mr-2">📋</span> Job Requirements
          </h3>
          
          {hoveredJobTitle && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-amber-50 p-4 rounded-lg shadow-md border border-amber-200 z-50">
              <p className="text-amber-700 text-sm">{jobDescription}</p>
            </div>
          )}
        </div>
      )}

      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
        {/* Draw straight line connections between thoughts */}
        {connections.map((connection, index) => {
          const { from, to } = connection;
          const fromX = `${from.x * 100}%`;
          const fromY = `${from.y * 100}%`;
          const toX = `${to.x * 100}%`;
          const toY = `${to.y * 100}%`;
          
          return (
            <g key={`connection-${index}`}>
              {/* Shadow line for better visibility */}
              <line 
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Main colored line */}
              <line 
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={typeColors[from.type].line}
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Add arrowhead */}
              <polygon
                points={`
                  ${parseFloat(toX)},${parseFloat(toY)} 
                  ${parseFloat(toX) - 5},${parseFloat(toY) - 5} 
                  ${parseFloat(toX) - 5},${parseFloat(toY) + 5}
                `}
                fill={typeColors[from.type].line}
                transform={`
                  rotate(
                    ${Math.atan2(
                      parseFloat(toY) - parseFloat(fromY),
                      parseFloat(toX) - parseFloat(fromX)
                    ) * (180 / Math.PI)},
                    ${toX},${toY}
                  )
                `}
              />
            </g>
          );
        })}
      </svg>

      {/* Render thought bubbles */}
      {visibleThoughts.map((thought) => {
        const typeColor = typeColors[thought.type] || { bg: 'bg-gray-200', text: 'text-gray-800', line: '#94a3b8' };
        const isHovered = hoveredThought?.id === thought.id;
        
        return (
          <div
            key={thought.id}
            className={`absolute transition-all duration-200 shadow-md rounded-lg p-3 cursor-pointer ${isHovered ? 'z-30' : 'z-20'} ${typeColor.bg} ${typeColor.text}`}
            style={{
              left: `${thought.x * 100}%`,
              top: `${thought.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              opacity: isHovered ? 1 : 0.9,
              maxWidth: '150px',
              minHeight: '70px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderWidth: isHovered ? '2px' : '1px',
              borderColor: isHovered ? '#2563eb' : typeColor.line,
              boxShadow: isHovered ? '0 0 0 2px rgba(37, 99, 235, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : ''
            }}
            onMouseEnter={() => setHoveredThought(thought)}
            onMouseLeave={() => setHoveredThought(null)}
          >
            <div className={`text-sm relative ${isHovered ? 'font-medium' : ''}`}>
              {thought.text}
            </div>
          </div>
        );
      })}

      {/* Hover popup - positioned with absolute width and always visible */}
      {hoveredThought && (
        <div 
          className="fixed z-50 bg-white p-4 rounded-lg shadow-xl border border-gray-200"
          style={{
            left: containerRef.current 
              ? containerRef.current.getBoundingClientRect().left + (hoveredThought.x * containerRef.current.offsetWidth)
              : 0,
            top: containerRef.current
              ? containerRef.current.getBoundingClientRect().top + (hoveredThought.y * containerRef.current.offsetHeight) + 30
              : 0,
            transform: 'translateX(-50%)',
            width: '320px',
            maxWidth: '95vw',
            pointerEvents: 'none',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {getThoughtDetail(hoveredThought)}
          
          {/* Add visual indicator to connect popup to the bubble */}
          <div 
            className="absolute top-0 left-1/2 w-4 h-4 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45 border-t border-l border-gray-200"
          ></div>
        </div>
      )}
    </div>
  );
};

export default ThoughtTreeCanvas; 