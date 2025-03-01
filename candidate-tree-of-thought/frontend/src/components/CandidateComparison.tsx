'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowRight, Brain, Award, CheckCircle, Briefcase, Users, ChevronRight, Vote } from 'lucide-react';

// Static data and configurations outside the component to prevent recreation
const mockProfiles = {
  candidate1: {
    name: "Jenny Nguyen",
    elo: "799",
    eloChange: "+3",
    profileImage: "/api/placeholder/150/150",
    experience: [
      {
        title: "Student Researcher in Owen Lab",
        organization: "Stanford University School of Medicine"
      },
      {
        title: "Intern in Brain Stimulation Lab",
        organization: "Stanford University School of Medicine"
      },
      {
        title: "Student Researcher in Südhof Lab",
        organization: "Stanford University School of Medicine"
      }
    ],
    education: [
      {
        institution: "Stanford University",
        degree: "Bachelor's Degree in Bioengineering"
      },
      {
        institution: "Indian River State College",
        degree: "Associate of Arts - AA"
      }
    ],
    honors: [
      "VPUE STEM Fellowship",
      "NeURO Fellowship",
      "Bio-X Undergraduate Fellowship"
    ]
  },
  candidate2: {
    name: "Radostin Cholakov",
    elo: "849",
    eloChange: "-3",
    profileImage: "/api/placeholder/150/150",
    experience: [
      {
        title: "Team Leader",
        organization: "International Olympiad in Artificial Intelligence (IOAI)"
      },
      {
        title: "Research Intern",
        organization: "MIT Computer Science and Artificial Intelligence Laboratory (CSAIL)"
      },
      {
        title: "Founder & ML Researcher",
        organization: "AzBuki.ML"
      }
    ],
    education: [
      {
        institution: "Stanford University",
        degree: "Bachelor's degree"
      },
      {
        institution: "Math High School \"Acad. Kiril Popov\"",
        degree: "in Computer Science"
      }
    ],
    honors: [
      "Honorable Mention by AAAI and First Award by Mawhiba at Regeneron ISEF'23",
      "Second Award - European Contest For Young Scientists 2022"
    ]
  }
};

const thoughts = [
  // Root/Starting nodes - moved down to create more space
  { id: 1, text: "Analyzing candidate profiles and job requirements...", children: [2, 3], x: 0.5, y: 0.25, type: "root" }, // moved from y: 0.1
  
  // First level branches - adjusted accordingly
  { id: 2, text: "Evaluating Jenny's qualifications", children: [4, 5], x: 0.25, y: 0.4, type: "branch1" }, // moved from y: 0.25
  { id: 3, text: "Evaluating Radostin's qualifications", children: [6, 7], x: 0.75, y: 0.4, type: "branch1" }, // moved from y: 0.25
  
  // Second level - Jenny's branches
  { id: 4, text: "Strong biomedical research background", children: [8], x: 0.15, y: 0.55, type: "jenny" }, // moved from y: 0.4
  { id: 5, text: "Multiple lab experiences at Stanford Medicine", children: [9], x: 0.35, y: 0.55, type: "jenny" }, // moved from y: 0.4
  
  // Second level - Radostin's branches
  { id: 6, text: "Leadership experience in AI competitions", children: [10], x: 0.65, y: 0.55, type: "radostin" }, // moved from y: 0.4
  { id: 7, text: "Technical AI research at MIT CSAIL", children: [11], x: 0.85, y: 0.55, type: "radostin" }, // moved from y: 0.4
  
  // Third level - deeper analysis
  { id: 8, text: "Analytical skills applicable to data-driven roles", children: [12], x: 0.1, y: 0.7, type: "jenny" }, // moved from y: 0.55
  { id: 9, text: "Research fellowships show academic excellence", children: [12], x: 0.3, y: 0.7, type: "jenny" }, // moved from y: 0.55
  { id: 10, text: "Team leadership demonstrates soft skills", children: [13], x: 0.7, y: 0.7, type: "radostin" }, // moved from y: 0.55
  { id: 11, text: "Technical AI work at top lab indicates expertise", children: [13], x: 0.9, y: 0.7, type: "radostin" }, // moved from y: 0.55
  
  // Fourth level - conclusions for each candidate
  { id: 12, text: "Jenny would excel in biotech research roles requiring lab experience", children: [14], x: 0.2, y: 0.85, type: "jenny" }, // moved from y: 0.7
  { id: 13, text: "Radostin would excel in AI/ML engineering and leadership roles", children: [14], x: 0.8, y: 0.85, type: "radostin" }, // moved from y: 0.7
  
  // Final evaluation
  { id: 14, text: "Evaluating fit against job description...", children: [15, 16], x: 0.5, y: 0.92, type: "final" }, // moved from y: 0.85
  { id: 15, text: "Jenny's lab experience aligns with wet-lab roles", children: [], x: 0.3, y: 0.97, type: "final" }, // moved from y: 0.95
  { id: 16, text: "Radostin's AI research aligns with ML engineering roles", children: [], x: 0.7, y: 0.97, type: "final" } // moved from y: 0.95
];

const typeColors = {
  root: { bg: "bg-blue-100", text: "text-blue-800", line: "#3B82F6" },
  branch1: { bg: "bg-indigo-100", text: "text-indigo-800", line: "#6366F1" },
  jenny: { bg: "bg-green-100", text: "text-green-800", line: "#10B981" },
  radostin: { bg: "bg-purple-100", text: "text-purple-800", line: "#8B5CF6" },
  final: { bg: "bg-amber-100", text: "text-amber-800", line: "#F59E0B" }
};

const CandidateComparison = () => {
  const [urls, setUrls] = useState({ candidate1: '', candidate2: '' });
  const [jobDescription, setJobDescription] = useState('');
  const [profiles, setProfiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [treeVisible, setTreeVisible] = useState(false);
  const [winner, setWinner] = useState(null);
  const [votes, setVotes] = useState({ candidate1: 0, candidate2: 0 });
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [processingStage, setProcessingStage] = useState(0); // 0: not started, 1: parsing, 2: analyzing, 3: voting, 4: complete
  
  // Prevent infinite renders by using refs for timers
  const analysisTimerRef = useRef(null);
  const votingIntervalRef = useRef(null);
  const thoughtTimerRef = useRef(null);
  
  // Reference for initialization flag to prevent repeating timers
  const initialized = useRef(false);

  const handleInputChange = (candidate, value) => {
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
    }, 400);
    
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

  // Render profile card
  const ProfileCard = ({ profile, isWinner, side }) => (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 relative ${
        isWinner ? 'ring-4 ring-green-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.name}</h3>
            <div className="flex items-center">
              <span className="text-gray-600">Elo: {profile.elo}</span>
              <span className={`ml-2 ${profile.eloChange.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                ({profile.eloChange})
              </span>
            </div>
          </div>
        </div>
        {isWinner && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Winner
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Experience</h4>
        <div className="space-y-3">
          {profile.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-3">
              <div className="font-medium">{exp.title}</div>
              <div className="text-sm text-gray-600">{exp.organization}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Education</h4>
        <div className="space-y-3">
          {profile.education.map((edu, index) => (
            <div key={index} className="border-l-2 border-purple-500 pl-3">
              <div className="font-medium">{edu.institution}</div>
              <div className="text-sm text-gray-600">{edu.degree}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2">Honors</h4>
        <div className="space-y-2">
          {profile.honors.map((honor, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-sm">{honor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Processing indicator with basic styling
  const ProcessingIndicator = ({ stage }) => {
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

  // 2D Thought Tree visualization without animations
  const ThoughtTreeCanvas = () => {
    const visibleThoughts = thoughts.slice(0, currentThoughtIndex + 1);
    
    // Calculate connections between thoughts - memoized to prevent recalculation
    const connections = useMemo(() => {
      const result = [];
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
    }, [visibleThoughts]);
    
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

  // Vote counter component
  const VoteCounter = () => (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-md mb-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Vote className="w-5 h-5 mr-2" />
        Community Votes
      </h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-lg font-medium">{mockProfiles.candidate1.name}</div>
          <div className="text-3xl font-bold text-blue-600">
            {votes.candidate1}
          </div>
        </div>
        
        <div className="h-16 w-px bg-gray-300 mx-8"></div>
        
        <div className="text-center">
          <div className="text-lg font-medium">{mockProfiles.candidate2.name}</div>
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
          Final Result: <span className="text-purple-600 font-bold">{mockProfiles[winner].name}</span> is the better match!
        </div>
      )}
    </div>
  );

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
                <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
            <>
              <ThoughtTreeCanvas />
              
              {processingStage >= 3 && <VoteCounter />}
              
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