// Define interfaces based on the MongoDB document structure
export interface CandidateExperience {
    name: string;
    profile_pic: string;
    education: Array<{
      degree: string;
      major: string;
      school: string;
      school_logo: string | null;
      start_date: string | null;
      end_date: string | null;
      linkedInUrl: string | null;
    }>;
    work_experience: Array<{
      company: string;
      company_logo: string | null;
      role: string;
      start_date: string;
      end_date: string;
      location: string;
      description_bullets: string[];
      years_worked: number | null;
    }>;
  }
  
  export interface EvaluationDocument {
    _id: string;
    candidate_experiences: {
      "Candidate A": CandidateExperience;
      "Candidate B": CandidateExperience;
    };
    iteration_1?: string[];
    iteration_2?: string[];
    iteration_3?: string[];
    final_winner?: string;
    majority_vote?: {
      "Candidate A": { $numberInt: string };
      "Candidate B": { $numberInt: string };
    };
    job_description?: string;
  }
  
  interface CandidateEvaluationRequest {
    job_description: string;
    profile_id_candidate_a: string;
    profile_id_candidate_b: string;
  }
  
  interface CandidateEvaluationResponse {
    document_id: string;
    success: boolean;
    message?: string;
  }
  
  // Update the BASE URL to use environment variable or default
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  
  /**
   * Submit a new evaluation request for two candidates
   * 
   * @param jobDescription - The job description to evaluate candidates against
   * @param candidateAId - ID of the first candidate
   * @param candidateBId - ID of the second candidate
   * @returns Promise resolving to the evaluation ID
   */
  export async function submitCandidateEvaluation(
    jobDescription: string,
    candidateAId: string,
    candidateBId: string
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluate_candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          profile_id_candidate_a: candidateAId,
          profile_id_candidate_b: candidateBId,
        } as CandidateEvaluationRequest),
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
  
      const data: CandidateEvaluationResponse = await response.json();
      
      // if (!data.success) {
      //   throw new Error(data.message || 'Failed to submit evaluation');
      // }
  
      return data.document_id;
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      throw error;
    }
  }
  
  /**
   * Fetch evaluation data for a specific evaluation ID
   * 
   * @param evaluationId - The ID of the evaluation to fetch
   * @returns Promise resolving to the evaluation data
   */
  export async function fetchEvaluationData(evaluationId: string): Promise<EvaluationDocument | null> {
    if (!evaluationId) {
      console.error('Invalid evaluation ID');
      return null;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/evaluate_candidates/${evaluationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Evaluation not found: ${evaluationId}`);
          return null;
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
  
      const data: EvaluationDocument = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching evaluation ${evaluationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Extract candidate IDs from the URL query parameters
   * 
   * @returns Object containing the extracted candidate IDs
   */
  export function extractCandidateIdsFromUrl(): { candidateAId: string | null, candidateBId: string | null } {
    // Only run on the client side
    if (typeof window === 'undefined') {
      return { candidateAId: null, candidateBId: null };
    }
  
    const params = new URLSearchParams(window.location.search);
    const candidateAId = params.get('candidateA');
    const candidateBId = params.get('candidateB');
  
    return { candidateAId, candidateBId };
  }