'use client';
import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SubmissionForm: React.FC = () => {
  const router = useRouter();
  const [urls, setUrls] = useState<{ candidate1: string; candidate2: string }>({ candidate1: '', candidate2: '' });
  const [jobDescription, setJobDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (candidate: string, value: string) => {
    setUrls(prev => ({ ...prev, [candidate]: value }));
  };

  const submitComparison = () => {
    if (loading) return; // Prevent multiple clicks
    
    setLoading(true);
    
    // In a real app, this would submit the form data to an API and get back an evaluationId
    // For demo purposes, we'll generate a random ID
    const generatedEvalId = `eval-${Math.random().toString(36).substring(2, 10)}`;
    
    // Redirect to the evaluation page with the new ID
    setTimeout(() => {
      router.push(`/evaluation/${generatedEvalId}`);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mercor Candidate Comparison
        </h1>
        <p className="text-gray-600">Compare candidates with AI-powered analysis</p>
      </div>
      
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
            onClick={submitComparison}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2 animate-spin" />
                Submitting...
              </div>
            ) : (
              <span className="flex items-center">
                Submit Comparison
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm; 