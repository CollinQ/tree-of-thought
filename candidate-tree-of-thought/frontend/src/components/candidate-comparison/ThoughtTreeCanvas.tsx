import React, { useMemo, useState } from 'react';
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
  // Track which thought bubble is being hovered
  const [hoveredThought, setHoveredThought] = useState<number | null>(null);
  
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

  // Generate additional details for each thought type
  const getThoughtDetails = (thought: typeof thoughts[0]) => {
    switch (thought.type) {
      case 'root':
        return "Starting the comparison process between candidates by analyzing their profiles against the job requirements.";
      case 'branch1':
        return thought.text.includes('Jenny') 
          ? "Evaluating Jenny's experience, skills, and qualifications to determine fit."
          : "Evaluating Radostin's experience, skills, and qualifications to determine fit.";
      case 'jenny':
        return "Analysis of Jenny's background in biomedical research, with particularly strong lab experience at Stanford Medicine.";
      case 'radostin':
        return "Analysis of Radostin's expertise in AI/ML research and leadership, with experience at MIT CSAIL.";
      case 'final':
        return "Concluding thoughts on candidate compatibility with specific job requirements.";
      default:
        return "Additional details about this thought process.";
    }
  };
  
  // Fixed canvas height
  const containerHeight = 650;
  
  // Calculate the vertical compression ratio based on tree depth
  const verticalScale = useMemo(() => {
    const maxYValue = visibleThoughts.length > 0 
      ? Math.max(...visibleThoughts.map(t => t.y))
      : 0;
    
    // Find the sweet spot for compression to use space without overflow
    if (maxYValue > 0.9) return 0.8;   // More compression for very deep trees
    if (maxYValue > 0.8) return 0.85;  // Medium compression for deep trees
    if (maxYValue > 0.7) return 0.9;   // Light compression for medium trees
    
    return 1; // No compression for shallow trees
  }, [visibleThoughts]);
  
  // Add bottom padding for spacing - reduced to prevent overflow
  const bottomPadding = 30;
  
  return (
    <div className="space-y-4">
      {/* Introduction text to explain the visualization */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">AI Thought Process</h3>
        <p className="text-sm text-gray-600">
          This visualization shows the AI's thought process when comparing the candidates. 
          <span className="text-blue-600 font-medium"> Hover over any thought bubble for more details.</span> 
          The colors indicate the focus area of each thought.
        </p>
      </div>
    
      <div 
        className="bg-gray-50 rounded-xl p-6 pb-10 shadow-inner mb-8 relative"
        style={{ height: `${containerHeight}px` }}
      >
        {/* Legend for thought types - at top left */}
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-10">
          <div className="text-sm font-medium mb-2">Thought Types</div>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(typeColors).map(([type, colors]) => (
              <div key={type} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${colors.bg} mr-2`}></div>
                <span className="text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Requirements - moved to top right */}
        <div className="absolute top-4 right-4 w-80 z-20">
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
            // Apply vertical scaling to the y positions, with moderate bottom padding
            const startX = connection.from.x * 100 + '%';
            const startY = `calc(${(connection.from.y * verticalScale * 100)}% + ${connection.from.y * bottomPadding}px)`;
            const endX = connection.to.x * 100 + '%';
            const endY = `calc(${(connection.to.y * verticalScale * 100)}% + ${connection.to.y * bottomPadding}px)`;
            
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
            className="absolute inline-block"
            style={{ 
              left: `calc(${thought.x * 100}% - 90px)`, 
              // Apply vertical scaling plus moderate bottom padding based on depth
              top: `calc(${thought.y * verticalScale * 100}% + ${thought.y * bottomPadding}px - 25px)`,
              width: "180px" // Fixed width for thought bubble container
            }}
          >
            <div
              className={`p-3 rounded-lg shadow-md ${typeColors[thought.type].bg} ${typeColors[thought.type].text} cursor-pointer transition-all hover:shadow-lg relative`}
              onMouseEnter={() => setHoveredThought(thought.id)}
              onMouseLeave={() => setHoveredThought(null)}
            >
              <p className="text-sm break-words">{thought.text}</p>
              
              {/* Hover popup with additional details */}
              {hoveredThought === thought.id && (
                <div 
                  className={`absolute z-50 bg-white text-gray-800 p-4 rounded-xl shadow-xl w-64 border border-gray-200 ${thought.y > 0.6 ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                  style={{ 
                    maxHeight: '250px', 
                    overflowY: 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="font-medium mb-2 pb-2 border-b border-gray-100">
                    {thought.text}
                  </div>
                  <p className="text-sm text-gray-600">
                    {getThoughtDetails(thought)}
                  </p>
                  {thought.type === 'jenny' && (
                    <div className="mt-2 text-xs bg-green-50 p-2 rounded text-green-700">
                      Strong biomedical research background with laboratory experience
                    </div>
                  )}
                  {thought.type === 'radostin' && (
                    <div className="mt-2 text-xs bg-purple-50 p-2 rounded text-purple-700">
                      Strong AI/ML research and demonstrated leadership abilities
                    </div>
                  )}
                  <div 
                    className={`absolute ${thought.y > 0.6 ? 'bottom-0 rotate-45 border-r border-b' : 'top-0 rotate-45 border-l border-t'} left-1/2 transform -translate-x-1/2 ${thought.y > 0.6 ? 'translate-y-1/2' : '-translate-y-1/2'} w-4 h-4 bg-white border-gray-200`}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThoughtTreeCanvas; 