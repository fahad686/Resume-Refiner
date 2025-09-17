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
    // In a real app, the AI flow would return an optimized resume.
    // For now, we return the original text but still provide keyword analysis.
    return {
      ...result,
      optimizedResume: input.resumeText, // Return original text for now
    };
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
