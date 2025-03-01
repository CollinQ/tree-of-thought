import { NextResponse } from 'next/server';

// This would be a real MongoDB connection in a production app
// For this demo, we'll simulate the data

type EvaluationDocument = {
  _id: { $oid: string };
  iteration_1: string[];
  iteration_2: string[];
  iteration_3: string[];
  final_winner: string | null;
  majority_vote: {
    "Candidate A": { $numberInt: string };
    "Candidate B": { $numberInt: string };
  };
};

// Mock database of evaluations
const mockDB: Record<string, EvaluationDocument> = {};

// Add the example document
const exampleDoc: EvaluationDocument = {
  _id: { $oid: "67c37dcde83f769118fe9276" },
  iteration_1: [
    "Candidate A demonstrates strong technical skills as evidenced by their experience in 'Experience details of Candidate A', which aligns well with the technical requirements outlined in 'Description of the job position'",
    "Candidate B exhibits superior leadership potential based on their interview performance, where they articulated clear examples of team management and conflict resolution as seen in 'Transcript of Candidate B'"
  ],
  iteration_2: [
    "Candidate A's technical expertise in 'Experience details of Candidate A' directly addresses the technical requirements in 'Description of the job position', suggesting they could quickly adapt to the role",
    "While Candidate A shows strong technical skills, Candidate B's experience may offer a more diverse skill set that could be valuable for long-term growth in the position as outlined in 'Description of the job position'",
    "Candidate B's leadership examples align closely with the job description's emphasis on team management, suggesting they may be better equipped to handle the role's supervisory responsibilities",
    "While Candidate B shows strong leadership potential, a review of Candidate A's technical skills and past performance is necessary to ensure we're not overlooking crucial qualifications for the position"
  ],
  iteration_3: [
    "Candidate A's technical expertise aligns closely with the job requirements, potentially allowing for a shorter onboarding period and immediate contributions to technical projects",
    "While Candidate A excels in technical skills, Candidate B may have stronger leadership qualities or soft skills that could be valuable for team collaboration and project management aspects of the role",
    "Candidate A's strong technical skills align closely with the job requirements, potentially allowing for immediate productivity in technical aspects of the role",
    "Candidate B's diverse experience suggests adaptability and a broader perspective, which could be beneficial for tackling complex, multifaceted projects outlined in the job description",
    "Candidate B's leadership examples demonstrate a track record of successful team management, which aligns well with the supervisory responsibilities outlined in the job description",
    "While Candidate A may have strong technical skills, their experience appears to lack the depth of team leadership that Candidate B possesses, potentially making them less suited for the managerial aspects of the role",
    "Candidate A's technical skills and past performance should be thoroughly evaluated against the job description requirements to determine if they meet or exceed the necessary qualifications",
    "While Candidate B shows strong leadership potential, it's important to assess how their leadership style aligns with the specific needs of the role and team dynamics outlined in the job description"
  ],
  final_winner: "Candidate B",
  majority_vote: {
    "Candidate A": { $numberInt: "3" },
    "Candidate B": { $numberInt: "5" }
  }
};

mockDB["67c37dcde83f769118fe9276"] = exampleDoc;

// Also store the document for any eval-* IDs (for demo submissions)
mockDB["demo"] = exampleDoc;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // In a real app, we would connect to MongoDB and fetch the document
    // For this demo, we'll use our mock database
    
    // Use the demo data for any evaluation ID that starts with "eval-"
    const docId = id.startsWith('eval-') ? 'demo' : id;
    
    const document = mockDB[docId];
    
    if (!document) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }
    
    // Simulate some server latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return NextResponse.json(
      { error: "Failed to fetch evaluation" },
      { status: 500 }
    );
  }
} 