'use server';

import {
  atsKeywordOptimization,
  type ATSKeywordOptimizationInput,
  type ATSKeywordOptimizationOutput,
} from '@/ai/flows/ats-keyword-optimization';

export async function optimizeResume(
  input: ATSKeywordOptimizationInput
): Promise<ATSKeywordOptimizationOutput> {
  try {
    const result = await atsKeywordOptimization(input);
    // The AI flow is a placeholder and returns the original resume.
    // In a real app, it would return an optimized version.
    // We return the result as is, which includes missing/suggested keywords.
    return result;
  } catch (error) {
    console.error('Error optimizing resume:', error);
    // This will be caught by the client and can be displayed in a toast.
    throw new Error('Failed to optimize resume. Please try again.');
  }
}
