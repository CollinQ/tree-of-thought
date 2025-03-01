'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';

// Import the abstracted components and types
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

const CandidateComparison = () => {
  const [urls, setUrls] = useState<{ candidate1: string; candidate2: string }>({ candidate1: '', candidate2: '' });
  const [jobDescription, setJobDescription] = useState<string>('');
  const [profiles, setProfiles] = useState<{ candidate1: ProfileData; candidate2: ProfileData } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
  
  // Reference for initialization flag to prevent repeating timers
  const initialized = useRef<boolean>(false);

  const handleInputChange = (candidate: string, value: string) => {
    setUrls(prev => ({ ...prev, [candidate]: value }));
  };

  const fetchProfiles = () => {
    if (loading) return; // Prevent multiple clicks
    
    setLoading(true);
    
    // Clear any existing timers to be safe
    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    if (votingIntervalRef.current) clearInterval(votingIntervalRef.current);
    if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    
    // Add a slight delay before showing profiles
    setTimeout(() => {
      setProfiles(mockProfiles);
      setLoading(false);
      
      // Add a delay before starting analysis
      analysisTimerRef.current = setTimeout(() => {
        startAnalysis();
      }, 1500); // Increased delay to give time to read profiles
    }, 1000);
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      if (votingIntervalRef.current) clearInterval(votingIntervalRef.current);
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mercor Candidate Comparison
        </h1>
        <p className="text-gray-600">Compare candidates with AI-powered analysis</p>
      </div>
      
      {!profiles ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Enter Comparison Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <div className="relative">
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 min-h-24"
                  placeholder="Enter the job requirements and qualifications..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 h-5 w-5 text-gray-400">📋</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate 1 URL</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  placeholder="https://mercor.io/profile/candidate1"
                  value={urls.candidate1}
                  onChange={(e) => handleInputChange('candidate1', e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate 2 URL</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  placeholder="https://mercor.io/profile/candidate2"
                  value={urls.candidate2}
                  onChange={(e) => handleInputChange('candidate2', e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center"
              onClick={fetchProfiles}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2 animate-spin" />
                  Fetching profiles...
                </div>
              ) : (
                <span className="flex items-center">
                  Compare Candidates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
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
          
          {winner && (
            <div className="mt-8 text-center">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-all"
                onClick={() => {
                  // Clear all timers
                  if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
                  if (votingIntervalRef.current) clearInterval(votingIntervalRef.current);
                  if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
                  
                  // Reset state
                  setProfiles(null);
                  setJobDescription('');
                  setUrls({ candidate1: '', candidate2: '' });
                  setAnalyzing(false);
                  setTreeVisible(false);
                  setWinner(null);
                  setVotes({ candidate1: 0, candidate2: 0 });
                  setCurrentThoughtIndex(0);
                  setProcessingStage(0);
                }}
              >
                Start New Comparison
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateComparison;