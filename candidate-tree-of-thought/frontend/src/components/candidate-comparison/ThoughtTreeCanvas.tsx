import React, { useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { ThoughtTreeProps } from './types';

/**
 * ThoughtTreeCanvas component displays the thought tree visualization
 */
const ThoughtTreeCanvas: React.FC<ThoughtTreeProps> = ({ 
  thoughts, 
  currentThoughtIndex,
  typeColors,
  jobDescription
}) => {
  const visibleThoughts = thoughts.slice(0, currentThoughtIndex + 1);
  
  // Calculate connections between thoughts - memoized to prevent recalculation
  const connections = useMemo(() => {
    const result: Array<{from: typeof thoughts[0], to: typeof thoughts[0]}> = [];
    visibleThoughts.forEach(thought => {
      thought.children.forEach(childId => {
        const childThought = thoughts.find(t => t.id === childId);
        if (childThought && visibleThoughts.includes(childThought)) {
          result.push({
            from: thought,
            to: childThought
          });
        }
      });
    });
    return result;
  }, [visibleThoughts, thoughts]);
  
  return (
    <div 
      className="bg-gray-50 rounded-xl p-6 shadow-inner mb-8 relative overflow-hidden"
      style={{ height: "700px" }} // Increased height to accommodate more space
    >
      {/* Job Requirements - moved to top right */}
      <div className="absolute top-4 right-4 w-80 z-20"> {/* Changed from left-1/2 and transform to right-4, adjusted width */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg shadow-md">
          <div className="flex items-center text-amber-800 font-medium mb-2">
            <Briefcase className="w-5 h-5 mr-2" />
            Job Requirements
          </div>
          <p className="text-sm text-amber-700">
            {jobDescription || "AI/ML Research Engineer with biotech experience"}
          </p>
        </div>
      </div>
      
      {/* SVG lines connecting thoughts */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {connections.map((connection, idx) => {
          const startX = connection.from.x * 100 + '%';
          const startY = connection.from.y * 100 + '%';
          const endX = connection.to.x * 100 + '%';
          const endY = connection.to.y * 100 + '%';
          
          return (
            <line
              key={`line-${connection.from.id}-${connection.to.id}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={typeColors[connection.from.type].line}
              strokeWidth="2"
              strokeDasharray="4"
              opacity="0.7"
            />
          );
        })}
      </svg>
      
      {/* Thought bubbles */}
      {visibleThoughts.map((thought) => (
        <div
          key={thought.id}
          className="absolute inline-block max-w-xs"
          style={{ 
            left: `calc(${thought.x * 100}% - 100px)`, 
            top: `calc(${thought.y * 100}% - 25px)` 
          }}
        >
          <div
            className={`p-3 rounded-lg shadow-md ${typeColors[thought.type].bg} ${typeColors[thought.type].text}`}
          >
            <p className="text-sm">{thought.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThoughtTreeCanvas; 