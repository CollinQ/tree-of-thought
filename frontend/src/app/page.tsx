import React from "react";
import SubmissionForm from "@/components/SubmissionForm";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full text-center row-start-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Candidate Comparison
        </h1>
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-6xl">
        <SubmissionForm />
      </main>
    </div>
  );
}
