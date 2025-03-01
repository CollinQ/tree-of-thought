'use client';
import React from 'react';
import SubmissionForm from './SubmissionForm';
import ComparisonResults from './ComparisonResults';

interface CandidateComparisonProps {
  evaluationId?: string;
}

// This component is now a wrapper that conditionally renders either the
// submission form or the comparison results based on whether an evaluationId is provided.
// It's kept for backward compatibility with existing code.
const CandidateComparison: React.FC<CandidateComparisonProps> = ({ evaluationId }) => {
  // If evaluationId is provided, show the comparison results
  if (evaluationId) {
    return <ComparisonResults evaluationId={evaluationId} />;
  }
  
  // Otherwise, show the submission form
  return <SubmissionForm />;
};

export default CandidateComparison;