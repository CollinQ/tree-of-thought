'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, Copy } from 'lucide-react';
import ComparisonResults from '@/components/ComparisonResults';

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch evaluation data based on the ID
    // For now we'll just fake a loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [evaluationId]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading evaluation results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full flex justify-between items-center row-start-1">
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </button>
        
        <h1 className="text-xl font-semibold">Evaluation Results</h1>
        
        <button 
          onClick={handleShare}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </>
          )}
        </button>
      </div>
      
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-6xl">
        <div className="w-full text-center mb-4 flex items-center justify-center space-x-2">
          <p className="text-sm text-gray-600">Evaluation ID: {evaluationId}</p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(evaluationId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
        
        {/* Pass the evaluationId to the ComparisonResults component */}
        <ComparisonResults evaluationId={evaluationId} />
      </main>
    </div>
  );
} 