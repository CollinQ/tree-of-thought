import React from 'react';
import { Users, Brain, Vote, CheckCircle } from 'lucide-react';
import { ProcessingIndicatorProps } from './types';

/**
 * ProcessingIndicator component displays the current processing stage
 */
const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ stage }) => {
  const stages = [
    { id: 1, text: "Parsing profiles", icon: <Users className="w-5 h-5" /> },
    { id: 2, text: "Analyzing qualifications", icon: <Brain className="w-5 h-5" /> },
    { id: 3, text: "Gathering votes", icon: <Vote className="w-5 h-5" /> }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Processing</h3>
      <div className="space-y-4">
        {stages.map((s) => (
          <div 
            key={s.id}
            className={`flex items-center p-3 rounded-lg ${
              stage >= s.id ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            <div 
              className={`mr-3 p-2 rounded-full ${
                stage > s.id ? "bg-green-100 text-green-600" : 
                stage === s.id ? "bg-blue-100 text-blue-600" : 
                "bg-gray-100 text-gray-400"
              }`}
            >
              {s.icon}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${
                stage > s.id ? "text-green-600" : 
                stage === s.id ? "text-blue-600" : 
                "text-gray-400"
              }`}>
                {s.text}
              </div>
              {stage === s.id && (
                <div className="text-blue-500 mt-1">
                  <span className="inline-block animate-pulse">●</span>
                  <span className="inline-block animate-pulse delay-150">●</span>
                  <span className="inline-block animate-pulse delay-300">●</span>
                </div>
              )}
            </div>
            {stage > s.id && (
              <div className="text-green-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingIndicator; 