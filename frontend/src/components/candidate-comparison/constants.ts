import { ProfileData, ThoughtNode, TypeColors } from './types';

// Static mock data for candidates
export const mockProfiles: { candidate1: ProfileData; candidate2: ProfileData } = {
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

// Thought tree nodes for visualization
export const thoughts: ThoughtNode[] = [
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

// Colors for different node types in the thought tree
export const typeColors: TypeColors = {
  root: { bg: "bg-blue-100", text: "text-blue-800", line: "#3B82F6" },
  branch1: { bg: "bg-indigo-100", text: "text-indigo-800", line: "#6366F1" },
  jenny: { bg: "bg-green-100", text: "text-green-800", line: "#10B981" },
  radostin: { bg: "bg-purple-100", text: "text-purple-800", line: "#8B5CF6" },
  final: { bg: "bg-amber-100", text: "text-amber-800", line: "#F59E0B" }
}; 