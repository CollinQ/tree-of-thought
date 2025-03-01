'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  ProfileCard,
  ProcessingIndicator,
  ThoughtTreeCanvas,
  VoteCounter,
  mockProfiles,
  thoughts,
  typeColors,
  ProfileData
} from './candidate-comparison';

interface ComparisonResultsProps {
  evaluationId: string;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({ evaluationId }) => {
  const [profiles, setProfiles] = useState<{ candidate1: ProfileData; candidate2: ProfileData } | null>(null);
  const [jobDescription, setJobDescription] = useState<string>(''); // This would come from API in real app
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [treeVisible, setTreeVisible] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ candidate1: number; candidate2: number }>({ candidate1: 0, candidate2: 0 });
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<number>(0); // 0: not started, 1: parsing, 2: analyzing, 3: voting, 4: complete
  
  // Prevent infinite renders by using refs for timers
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const votingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thoughtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect to load evaluation data
  useEffect(() => {
    // In a real app, this would fetch evaluation details based on the evaluationId
    setProfiles(mockProfiles);
    
    // Simulate fetching job description
    setJobDescription("Seeking a frontend developer with 3+ years of experience in React, TypeScript, and modern UI frameworks. The ideal candidate will have experience with state management libraries, responsive design, and performance optimization.");
    
    setTimeout(() => {
      startAnalysis();
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      if (votingIntervalRef.current) clearInterval(votingIntervalRef.current);
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
  }, [evaluationId]);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProcessingStage(1); // Parsing stage
  };

  // This effect handles all the staged transitions based on processingStage
  useEffect(() => {
    if (!analyzing) return;
    
    // Clear existing timers
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    
    // Stage transitions
    if (processingStage === 1) {
      analysisTimerRef.current = setTimeout(() => {
        setProcessingStage(2); // Move to analyzing stage
      }, 2000);
    } 
    else if (processingStage === 2) {
      analysisTimerRef.current = setTimeout(() => {
        setTreeVisible(true);
        setProcessingStage(3); // Move to voting stage
      }, 2000);
    }
    else if (processingStage === 3) {
      startVoting();
    }
    
    return () => {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    };
  }, [analyzing, processingStage]);

  // Separate the voting logic into its own function
  const startVoting = () => {
    if (votingIntervalRef.current) clearInterval(votingIntervalRef.current);
    
    // Simulate voting process with random votes
    votingIntervalRef.current = setInterval(() => {
      setVotes(prev => {
        // Slightly bias toward candidate2 for demo purposes
        const candidate = Math.random() > 0.4 ? 'candidate2' : 'candidate1';
        return { ...prev, [candidate]: prev[candidate] + 1 };
      });
    }, 200);

    // Stop voting after some time and declare winner
    analysisTimerRef.current = setTimeout(() => {
      if (votingIntervalRef.current) {
        clearInterval(votingIntervalRef.current);
        votingIntervalRef.current = null;
      }
      
      // Force candidate2 as winner for demo purposes
      setWinner('candidate2');
      setProcessingStage(4); // Complete
    }, 3000);
  };

  // Advance thought tree animation - only when treeVisible is true
  useEffect(() => {
    if (!treeVisible || currentThoughtIndex >= thoughts.length - 1) return;
    
    if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    
    thoughtTimerRef.current = setTimeout(() => {
      setCurrentThoughtIndex(prev => prev + 1);
    }, 500); // Slightly slower animation to give time to view popups
    
    return () => {
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
  }, [treeVisible, currentThoughtIndex]);

  if (!profiles) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      {!treeVisible ? (
        // Initial profiles view with processing indicator
        <>
          <ProcessingIndicator stage={processingStage} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-0">
            <div className="relative z-10">
              <ProfileCard profile={profiles.candidate1} isWinner={false} side="left" />
            </div>
            <div className="relative z-10">
              <ProfileCard profile={profiles.candidate2} isWinner={false} side="right" />
            </div>
          </div>
        </>
      ) : (
        // Tree visualization and voting
        <div className="space-y-8"> {/* Added spacing for better layout with taller tree */}
          <ThoughtTreeCanvas 
            thoughts={thoughts} 
            currentThoughtIndex={currentThoughtIndex} 
            typeColors={typeColors}
            jobDescription={jobDescription}
          />
          
          {processingStage >= 3 && (
            <VoteCounter 
              votes={votes} 
              profiles={profiles} 
              winner={winner} 
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCard 
              profile={profiles.candidate1} 
              isWinner={winner === 'candidate1'}
              side="left"
            />
            <ProfileCard 
              profile={profiles.candidate2} 
              isWinner={winner === 'candidate2'}
              side="right"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonResults; 