'use server';

import {
  atsKeywordOptimization,
  type ATSKeywordOptimizationInput,
  type ATSKeywordOptimizationOutput,
} from '@/ai/flows/ats-keyword-optimization';
import {
  improveExperience,
  type ExperienceImprovementInput,
  type ExperienceImprovementOutput,
} from '@/ai/flows/experience-improvement';
import {
  improveResumeSummary,
  type ResumeSummaryImprovementInput,
  type ResumeSummaryImprovementOutput,
} from '@/ai/flows/resume-summary-improvement';

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

export async function improveSummaryAction(
  input: ResumeSummaryImprovementInput
): Promise<ResumeSummaryImprovementOutput> {
  try {
    const result = await improveResumeSummary(input);
    return result;
  } catch (error) {
    console.error('Error improving summary:', error);
    throw new Error('Failed to improve summary. Please try again.');
  }
}

export async function improveExperienceAction(
  input: ExperienceImprovementInput
): Promise<ExperienceImprovementOutput> {
  try {
    const result = await improveExperience(input);
    return result;
  } catch (error) {
    console.error('Error improving experience:', error);
    throw new Error('Failed to improve experience. Please try again.');
  }
}
