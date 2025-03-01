import React from 'react';
import { Vote } from 'lucide-react';
import { VoteCounterProps } from './types';

/**
 * VoteCounter component displays the voting progress and results
 */
const VoteCounter: React.FC<VoteCounterProps> = ({ votes, profiles, winner }) => {
  // Get the winning profile name safely
  const getWinnerName = () => {
    if (winner === 'candidate1') return profiles.candidate1.name;
    if (winner === 'candidate2') return profiles.candidate2.name;
    return '';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-md mb-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Vote className="w-5 h-5 mr-2" />
        Community Votes
      </h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-lg font-medium">{profiles.candidate1.name}</div>
          <div className="text-3xl font-bold text-blue-600">
            {votes.candidate1}
          </div>
        </div>
        
        <div className="h-16 w-px bg-gray-300 mx-8"></div>
        
        <div className="text-center">
          <div className="text-lg font-medium">{profiles.candidate2.name}</div>
          <div className="text-3xl font-bold text-purple-600">
            {votes.candidate2}
          </div>
        </div>
      </div>
      
      {/* Vote progress bar */}
      <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ 
            width: `${votes.candidate1 + votes.candidate2 > 0 
              ? (votes.candidate1 / (votes.candidate1 + votes.candidate2)) * 100 
              : 50}%` 
          }}
        />
      </div>
      
      {winner && (
        <div className="mt-4 text-center font-medium text-lg">
          Final Result: <span className="text-purple-600 font-bold">{getWinnerName()}</span> is the better match!
        </div>
      )}
    </div>
  );
};

export default VoteCounter; 