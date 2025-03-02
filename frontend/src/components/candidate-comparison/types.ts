// Types for CandidateComparison components

export interface ProfileData {
  name: string;
  profilePic: string;
  experience: {
    company: string;
    companyLogo: string;
    descriptionBullets: string[];
    endDate: string;
    startDate: string;
    role: string;
    yearsWorked: string;
  }[];
  education: {
    major: string;
    degree: string;
    school: string;
    schoolLogo: string | null;
  }[];
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
  fullText?: string; // Optional property to store the complete text for popups
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