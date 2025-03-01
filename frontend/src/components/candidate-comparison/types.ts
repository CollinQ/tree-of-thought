// Types for CandidateComparison components

export interface ProfileData {
  name: string;
  elo: string;
  eloChange: string;
  profileImage: string;
  experience: {
    title: string;
    organization: string;
  }[];
  education: {
    institution: string;
    degree: string;
  }[];
  honors: string[];
}

export interface ProfileCardProps {
  profile: ProfileData;
  isWinner: boolean;
  side: string;
}

export interface ProcessingIndicatorProps {
  stage: number;
}

export interface ThoughtNode {
  id: number;
  text: string;
  children: number[];
  x: number;
  y: number;
  type: string;
}

export interface TypeColor {
  bg: string;
  text: string;
  line: string;
}

export interface TypeColors {
  [key: string]: TypeColor;
}

export interface ThoughtTreeProps {
  thoughts: ThoughtNode[];
  currentThoughtIndex: number;
  typeColors: TypeColors;
  jobDescription: string;
}

export interface VoteCounterProps {
  votes: {
    candidate1: number;
    candidate2: number;
  };
  profiles: {
    candidate1: ProfileData;
    candidate2: ProfileData;
  };
  winner: string | null;
} 