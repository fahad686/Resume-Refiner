// ATSKeywordOptimization
'use server';
/**
 * @fileOverview This file defines a Genkit flow for optimizing a resume with ATS keywords.
 *
 * - atsKeywordOptimization - A function that optimizes the resume with keywords.
 * - ATSKeywordOptimizationInput - The input type for the atsKeywordOptimization function.
 * - ATSKeywordOptimizationOutput - The return type for the atsKeywordOptimization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ATSKeywordOptimizationInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be optimized.'),
  jobDescription: z
    .string()
    .describe('The job description used to identify missing keywords.'),
});
export type ATSKeywordOptimizationInput = z.infer<
  typeof ATSKeywordOptimizationInputSchema
>;

const ATSKeywordOptimizationOutputSchema = z.object({
  optimizedResume: z
    .string()
    .describe('The resume text optimized with relevant keywords.'),
  missingKeywords: z
    .array(z.string())
    .describe('List of keywords missing from the resume.'),
  suggestedKeywords: z
    .array(z.string())
    .describe('Suggested keywords to add to the resume.'),
});
export type ATSKeywordOptimizationOutput = z.infer<
  typeof ATSKeywordOptimizationOutputSchema
>;

export async function atsKeywordOptimization(
  input: ATSKeywordOptimizationInput
): Promise<ATSKeywordOptimizationOutput> {
  return atsKeywordOptimizationFlow(input);
}

const atsKeywordOptimizationFlow = ai.defineFlow(
  {
    name: 'atsKeywordOptimizationFlow',
    inputSchema: ATSKeywordOptimizationInputSchema,
    outputSchema: ATSKeywordOptimizationOutputSchema,
  },
  async input => {
    const { output } = await ai.generate({
      prompt: `You are an expert ATS optimization tool.
      Analyze the provided resume text and job description.
      Resume:
      ${input.resumeText}

      Job Description:
      ${input.jobDescription}

      1. Identify and list important keywords and skills from the job description that are missing from the resume.
      2. Suggest a list of relevant keywords to add to the resume based on the job description.
      3. Provide an optimized version of the resume that strategically incorporates some of the missing keywords. Maintain the original format and tone of the resume as much as possible.

      Return your response in a JSON format with three keys: 'missingKeywords', 'suggestedKeywords', and 'optimizedResume'.`,
      output: {
        schema: ATSKeywordOptimizationOutputSchema,
      },
      model: 'googleai/gemini-2.5-flash',
    });
    return output!;
  }
);
