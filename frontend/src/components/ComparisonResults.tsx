'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ProfileCard,
  ProcessingIndicator,
  VoteCounter,
  mockProfiles,
  thoughts,
  typeColors,
  ProfileData,
  ThoughtNode
} from './candidate-comparison';
import ThoughtTreeCanvas from './candidate-comparison/ThoughtTreeCanvas';
import { fetchEvaluationData, EvaluationDocument } from '@/lib/api';

// Define mock evaluation data
const mockEvaluationData: EvaluationDocument = {
  _id: { $oid: "mock123456789" },
  iteration_1: [
    "Candidate A has 5 years of experience with React.",
    "Candidate B shows strong TypeScript skills.",
    "Candidate A demonstrates UI/UX expertise.",
    "Candidate B has experience with Next.js framework."
  ],
  iteration_2: [
    "Candidate A's portfolio shows clean, maintainable code.",
    "Candidate B has contributed to open source projects.",
    "Candidate A has experience leading frontend teams.",
    "Candidate B demonstrates strong problem-solving skills."
  ],
  iteration_3: [
    "Candidate A would be good for design-heavy projects.",
    "Candidate B appears stronger in technical implementation.",
    "Candidate A has excellent communication skills.",
    "Candidate B has more experience with modern frameworks."
  ],
  final_winner: "Candidate B",
  majority_vote: {
    "Candidate A": { $numberInt: "3" },
    "Candidate B": { $numberInt: "7" }
  }
};

interface ComparisonResultsProps {
  evaluationId?: string | null;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({ evaluationId, ...props }) => {
  const [profiles, setProfiles] = useState<{ candidate1: ProfileData; candidate2: ProfileData } | null>(null);
  const [jobDescription, setJobDescription] = useState<string>(''); // This would come from API in real app
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [treeVisible, setTreeVisible] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ candidate1: number; candidate2: number }>({ candidate1: 0, candidate2: 0 });
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<number>(0); // 0: not started, 1: parsing, 2: analyzing, 3: voting, 4: complete
  const [evaluationData, setEvaluationData] = useState<EvaluationDocument | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent infinite renders by using refs for timers
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const votingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thoughtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add debug state for showing additional information
  const [debug, setDebug] = useState(false);

  // Function to fetch evaluation data from API
  const fetchEvaluationDataFromApi = async (evalId: string | null) => {
    console.debug("fetchEvaluationData called with ID:", evalId);
    setLoading(true);
    
    try {
      if (!evalId) {
        console.debug("No evaluation ID provided, using mock data");
        // Fall back to mock data if no evaluation ID is provided
        setTimeout(() => {
          if (!profiles) {
            console.debug("Setting mock profiles");
            const mockCandidate1 = Array.isArray(mockProfiles) ? mockProfiles[0] : mockProfiles.candidate1;
            const mockCandidate2 = Array.isArray(mockProfiles) ? mockProfiles[1] : mockProfiles.candidate2;
            
            setProfiles({
              candidate1: mockCandidate1,
              candidate2: mockCandidate2
            });
          }
          setEvaluationData(mockEvaluationData);
          setInitialDataLoaded(true);
          setLoading(false);
        }, 1000);
        return;
      }
      
      console.debug("Fetching evaluation data from API for ID:", evalId);
      const data = await fetchEvaluationData(evalId);
      
      if (!data) {
        console.warn("No data returned from API, falling back to mock data");
        setEvaluationData(mockEvaluationData);
      } else {
        console.debug("API data received:", data);
        setEvaluationData(data);
        if (data?.majority_vote) {
          
          const voteA = data.majority_vote["Candidate A"] || 0;
          const voteB = data.majority_vote["Candidate B"] || 0;
          
          // console.debug("Setting votes from API data", { voteA, voteB });
          setVotes({
            candidate1: voteA,
            candidate2: voteB
          });
        }
        
        // If we have candidate experiences, set up the profiles
        if (data.candidate_experiences) {
          const candidateA = data.candidate_experiences["Candidate A"];
          const candidateB = data.candidate_experiences["Candidate B"];
          
          if (candidateA && candidateB) {
            console.debug("Setting profiles from API data");
            // Convert the API data structure to match the ProfileData structure
            setProfiles({
              candidate1: {
                name: candidateA.name,
                profilePic: candidateA.profile_pic,
                education: candidateA.education.map(edu => ({
                  degree: edu.degree,
                  major: edu.major,
                  school: edu.school,
                  schoolLogo: edu.school_logo || null
                })),
                experience: candidateA.work_experience.map(work => ({
                  company: work.company,
                  companyLogo: work.company_logo || "",
                  role: work.role,
                  startDate: work.start_date,
                  endDate: work.end_date,
                  descriptionBullets: work.description_bullets,
                  yearsWorked: work.years_worked ? work.years_worked.toString() : ""
                }))
              },
              candidate2: {
                name: candidateB.name,
                profilePic: candidateB.profile_pic,
                education: candidateB.education.map(edu => ({
                  degree: edu.degree,
                  major: edu.major,
                  school: edu.school,
                  schoolLogo: edu.school_logo || null
                })),
                experience: candidateB.work_experience.map(work => ({
                  company: work.company,
                  companyLogo: work.company_logo || "",
                  role: work.role,
                  startDate: work.start_date,
                  endDate: work.end_date,
                  descriptionBullets: work.description_bullets,
                  yearsWorked: work.years_worked ? work.years_worked.toString() : ""
                }))
              }
            });
          }
        }
        
        // Set job description if available
        if (data.job_description) {
          setJobDescription(data.job_description);
        }
      }
      
      setInitialDataLoaded(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      setLoading(false);
      setError("Failed to load evaluation data. Please try again.");
      
      // Fall back to mock data in case of error
      setTimeout(() => {
        setEvaluationData(mockEvaluationData);
        setInitialDataLoaded(true);
      }, 1000);
    }
  };

  // Safely create candidate nodes with proper null checks
    const candidateANodes = {
    level1: evaluationData?.iteration_1 ? 
      evaluationData.iteration_1.filter(t => t.includes("Candidate A")).length : 0,
    level2: evaluationData?.iteration_2 ? 
      evaluationData.iteration_2.filter(t => t.includes("Candidate A")).length : 0,
    level3: evaluationData?.iteration_3 ? 
      evaluationData.iteration_3.filter(t => t.includes("Candidate A")).length : 0
    };
    
    const candidateBNodes = {
    level1: evaluationData?.iteration_1 ? 
      evaluationData.iteration_1.filter(t => t.includes("Candidate B")).length : 0,
    level2: evaluationData?.iteration_2 ? 
      evaluationData.iteration_2.filter(t => t.includes("Candidate B")).length : 0,
    level3: evaluationData?.iteration_3 ? 
      evaluationData.iteration_3.filter(t => t.includes("Candidate B")).length : 0
  };

  // Update the evaluationThoughts useMemo function to create proper ThoughtNode objects
  const evaluationThoughts = useMemo(() => {
    console.debug("Processing evaluation thoughts data");
    
    if (!evaluationData) {
      console.debug("No evaluation data available yet");
      return [];
    }
    
    let thoughts: ThoughtNode[] = [];
    let thoughtId = 0;
    
    // Process iteration 1 if it exists
    if (evaluationData.iteration_1 && Array.isArray(evaluationData.iteration_1)) {
      console.debug("Processing iteration 1 with", evaluationData.iteration_1.length, "thoughts");
      evaluationData.iteration_1.forEach((thought) => {
        const isAboutCandidateA = thought.includes("Candidate A");
        const isAboutCandidateB = thought.includes("Candidate B");
        
        thoughts.push({
          id: thoughtId++,
          level: 1,
          content: thought,
          text: thought.substring(0, 60) + (thought.length > 60 ? "..." : ""),
          fullText: thought,
          type: isAboutCandidateA ? 'jenny' : isAboutCandidateB ? 'radostin' : 'analysis',
          candidateA: isAboutCandidateA,
          candidateB: isAboutCandidateB,
          children: [] // Will be populated during positioning
        });
      });
      } else {
      console.debug("Iteration 1 is missing or not an array");
    }
    
    // Process iteration 2 if it exists
    if (evaluationData.iteration_2 && Array.isArray(evaluationData.iteration_2)) {
      console.debug("Processing iteration 2 with", evaluationData.iteration_2.length, "thoughts");
      evaluationData.iteration_2.forEach((thought) => {
        const isAboutCandidateA = thought.includes("Candidate A");
        const isAboutCandidateB = thought.includes("Candidate B");
        
        thoughts.push({
          id: thoughtId++,
          level: 2,
          content: thought,
          text: thought.substring(0, 60) + (thought.length > 60 ? "..." : ""),
          fullText: thought,
          type: isAboutCandidateA ? 'jenny' : isAboutCandidateB ? 'radostin' : 'analysis',
          candidateA: isAboutCandidateA,
          candidateB: isAboutCandidateB,
          children: [] // Will be populated during positioning
        });
      });
      } else {
      console.debug("Iteration 2 is missing or not an array");
    }
    
    // Process iteration 3 if it exists
    if (evaluationData.iteration_3 && Array.isArray(evaluationData.iteration_3)) {
      console.debug("Processing iteration 3 with", evaluationData.iteration_3.length, "thoughts");
      evaluationData.iteration_3.forEach((thought) => {
        const isAboutCandidateA = thought.includes("Candidate A");
        const isAboutCandidateB = thought.includes("Candidate B");
        
        thoughts.push({
          id: thoughtId++,
          level: 3,
          content: thought,
          text: thought.substring(0, 60) + (thought.length > 60 ? "..." : ""),
          fullText: thought,
          type: isAboutCandidateA ? 'jenny' : isAboutCandidateB ? 'radostin' : 'analysis',
          candidateA: isAboutCandidateA,
          candidateB: isAboutCandidateB,
          children: [] // Will be populated during positioning
        });
      });
    } else {
      console.debug("Iteration 3 is missing or not an array");
    }
    
    console.debug("Processed total thoughts:", thoughts.length);
    return thoughts;
  }, [evaluationData]);

  // Update the polling effect to be more robust
  useEffect(() => {
    console.debug("Evaluation ID effect triggered:", evaluationId);
    
    // Fetch data immediately on mount
    fetchEvaluationDataFromApi(evaluationId || null);
    
    // Setup polling
    if (evaluationId) {
      console.debug("Setting up polling for evaluation updates");
      
      // Poll more frequently at first (every 3 seconds), then slow down
      const pollInterval = 3000;
      pollingIntervalRef.current = setInterval(() => {
        // Only poll if we have an evaluation ID and the evaluation is not complete
        if (!evaluationData?.final_winner) {
          console.debug("Polling for evaluation updates...");
          fetchEvaluationDataFromApi(evaluationId);
        } else {
          // Stop polling once we have complete data
          console.debug("Final results received, stopping polling");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }, pollInterval);
      
      // Add backoff logic - slow down polling after 30 seconds
      setTimeout(() => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = setInterval(() => {
            if (!evaluationData?.final_winner) {
              fetchEvaluationDataFromApi(evaluationId);
            } else if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }, 5000); // Slower polling
        }
      }, 30000);
    }
    
    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [evaluationId]);

  // Add a separate effect to handle updates when evaluation data changes
  useEffect(() => {
    if (evaluationData?.final_winner && pollingIntervalRef.current) {
      console.debug("Evaluation complete, stopping polling");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [evaluationData?.final_winner]);

  // Add a useEffect to automatically show evaluation when data is fully loaded
  useEffect(() => {
    console.debug("Visualization effect triggered:", {
      initialDataLoaded,
      hasProfiles: !!profiles,
      hasEvalData: !!evaluationData,
      analyzing
    });
    
    if (initialDataLoaded && profiles && evaluationData && !analyzing) {
      console.debug("Starting analysis with data:", { 
        profilesSet: !!profiles,
        evalDataSet: !!evaluationData,
        finalWinner: evaluationData.final_winner,
        majorityVotes: evaluationData.majority_vote
      });
      
      // If we have loaded all necessary data, start the visualization process
      startAnalysis();
      
      // If we have complete data, fast-forward to the final state
      if (evaluationData.final_winner) {
        console.debug("Fast-forwarding with complete data");
        setTreeVisible(true);
        setProcessingStage(4); // Complete stage
        
        // Set the winner
        const mappedWinner = evaluationData.final_winner === "Candidate A" ? "candidate1" : "candidate2";
        setWinner(mappedWinner);
        
        // Set the vote counts based on the majority_vote data
        if (evaluationData.majority_vote) {
          const voteA = parseInt(evaluationData.majority_vote["Candidate A"].$numberInt) || 0;
          const voteB = parseInt(evaluationData.majority_vote["Candidate B"].$numberInt) || 0;
          
          console.debug("Setting final vote counts:", { voteA, voteB });
          
          setVotes({
            candidate1: voteA,
            candidate2: voteB
          });
        }
        
        // For complete data, set the thought index to show most of the thoughts
        // But still leave a few to animate in
        if (evaluationThoughts.length > 2) {
          setCurrentThoughtIndex(Math.floor(evaluationThoughts.length * 0.7));
        }
      }
    }
  }, [initialDataLoaded, profiles, evaluationData, analyzing, evaluationThoughts]);

  // Effect to load evaluation data
  useEffect(() => {
    console.debug("Data loading effect triggered. Initial data loaded:", initialDataLoaded);
    
    // Set default profiles if we don't have any and need a fallback
    if (!profiles && initialDataLoaded) {
      console.debug("Setting default profiles");
      const mockCandidate1 = Array.isArray(mockProfiles) ? mockProfiles[0] : mockProfiles.candidate1;
      const mockCandidate2 = Array.isArray(mockProfiles) ? mockProfiles[1] : mockProfiles.candidate2;
      
      setProfiles({
        candidate1: mockCandidate1,
        candidate2: mockCandidate2
      });
    }
    
    // Only set default job description if it's not already set by the API and we need a fallback
    if (!jobDescription && initialDataLoaded) {
      setJobDescription("Seeking a frontend developer with 3+ years of experience in React, TypeScript, and modern UI frameworks. The ideal candidate will have experience with state management libraries, responsive design, and performance optimization.");
    }
    
    // Cleanup on unmount
    return () => {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
      if (votingIntervalRef.current) clearInterval(votingIntervalRef.current);
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
  }, [evaluationId, jobDescription, initialDataLoaded, profiles]);

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
    
    // If we already have data from the API, use that
    if (evaluationData?.final_winner && evaluationData?.majority_vote) {
      // Debug voting data
      console.debug("Setting votes from evaluation data:", {
        candidateA: evaluationData.majority_vote["Candidate A"].$numberInt,
        candidateB: evaluationData.majority_vote["Candidate B"].$numberInt,
        parsed: {
          candidateA: parseInt(evaluationData.majority_vote["Candidate A"].$numberInt),
          candidateB: parseInt(evaluationData.majority_vote["Candidate B"].$numberInt)
        }
      });
      
      // Update the voting display with the API data
      const voteA = parseInt(evaluationData.majority_vote["Candidate A"].$numberInt) || 0;
      const voteB = parseInt(evaluationData.majority_vote["Candidate B"].$numberInt) || 0;
      
      setVotes({
        candidate1: voteA,
        candidate2: voteB
      });
      
      // Set the winner based on the API data
      const mappedWinner = evaluationData.final_winner === "Candidate A" ? "candidate1" : "candidate2";
      setWinner(mappedWinner);
      
      // Move to complete stage
      setProcessingStage(4);
    } else {
      // Fallback to simulated voting if no API data
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
        
        // Force candidate2 as winner for demo purposes if we don't have real data
        setWinner('candidate2');
        setProcessingStage(4); // Complete
      }, 3000);
    }
  };

  // Advance thought tree animation - only when treeVisible is true
  useEffect(() => {
    if (!treeVisible || currentThoughtIndex >= evaluationThoughts.length - 1) return;
    
    // If we have API data and we're showing the tree for the first time
    // we can speed up the animation to reveal all nodes quickly
    if (evaluationData?.final_winner) {
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
      
      thoughtTimerRef.current = setTimeout(() => {
        setCurrentThoughtIndex(prev => Math.min(prev + 2, evaluationThoughts.length - 1));
      }, 150); // Faster animation for API data
    } else {
      // Normal animation speed for simulated data
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
      
      thoughtTimerRef.current = setTimeout(() => {
        setCurrentThoughtIndex(prev => prev + 1);
      }, 500);
    }
    
    return () => {
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
  }, [treeVisible, currentThoughtIndex, evaluationThoughts.length, evaluationData]);

  // Add keydown listener for debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modify the initial loading state to check for initial data loaded
  if (!initialDataLoaded) {
    return (
      <div className="min-h-[300px] flex flex-col justify-center items-center py-10">
        <div className="rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
        <p className="text-gray-600">Loading evaluation data...</p>
      </div>
    );
  }

  // If we have loaded initial data but don't have profiles yet, use the mock profiles as fallback
  if (!profiles) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}
      
      {!initialDataLoaded ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600 text-center">
            <p className="font-semibold mb-2">Loading evaluation data...</p>
            <p className="text-sm text-gray-500">This may take a moment as we analyze the candidates.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {(evaluationData && profiles && profiles.candidate1 && profiles.candidate2) ? (
            <>
              {/* Job Requirements */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Job Requirements</h2>
                <p className="text-gray-700">{jobDescription || evaluationData?.job_description || "AI/ML Research Engineer with biotech experience"}</p>
              </div>
              
              {/* Thought Tree */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">AI Analysis Process</h2>
                <p className="text-gray-600 mb-6">
                  This visualization shows how the AI analyzed both candidates against the job requirements. 
                  Hover over any thought bubble to see more details.
                </p>
                <div className="w-full max-w-full overflow-x-hidden">
                  <ThoughtTreeCanvas 
                    thoughts={evaluationThoughts}
                    currentThoughtIndex={currentThoughtIndex}
                    typeColors={typeColors}
                    jobDescription={jobDescription || evaluationData?.job_description}
                  />
                </div>
              </div>
              
              {/* Vote Counter */}
              <VoteCounter 
                votes={votes}
                profiles={{
                  candidate1: profiles.candidate1,
                  candidate2: profiles.candidate2
                }}
                winner={winner}
              />
              
              {/* Profile Cards */}
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
            </>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading candidate profiles...</p>
            </div>
          )}
          
          {/* Show debug info when debugging - Press D key to toggle */}
          {debug && evaluationData && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-8">
              <h3 className="text-sm font-mono mb-2">Debug Information</h3>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify({
                  evaluationId,
                  evaluationData: {
                    ...evaluationData,
                    iteration_1: evaluationData.iteration_1?.length + " thoughts",
                    iteration_2: evaluationData.iteration_2?.length + " thoughts",
                    iteration_3: evaluationData.iteration_3?.length + " thoughts",
                  }
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparisonResults; 