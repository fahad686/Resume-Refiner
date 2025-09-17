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

const getMissingKeywords = ai.defineTool({
  name: 'getMissingKeywords',
  description:
    'Identifies keywords missing from the resume based on the job description.',
  inputSchema: z.object({
    resumeText: z
      .string()
      .describe('The text content of the resume to be optimized.'),
    jobDescription: z
      .string()
      .describe('The job description used to identify missing keywords.'),
  }),
  outputSchema: z.array(z.string()),
  async resolve(input) {
    // Placeholder implementation for identifying missing keywords.
    // In a real application, this would involve NLP techniques to extract
    // relevant keywords from the job description and compare them against the
    // resume text.
    const jobDescriptionKeywords = input.jobDescription
      .toLowerCase()
      .split(/\s+/);
    const resumeKeywords = input.resumeText.toLowerCase().split(/\s+/);

    const missingKeywords = jobDescriptionKeywords.filter(
      keyword => !resumeKeywords.includes(keyword)
    );

    return missingKeywords;
  },
});

const suggestKeywords = ai.defineTool({
  name: 'suggestKeywords',
  description:
    'Suggests keywords to add to the resume based on the job description.',
  inputSchema: z.object({
    jobDescription: z
      .string()
      .describe('The job description used to suggest keywords.'),
  }),
  outputSchema: z.array(z.string()),
  async resolve(input) {
    // Placeholder implementation for suggesting keywords.
    // In a real application, this would involve NLP techniques to extract
    // relevant keywords from the job description and provide synonyms or related terms.
    const jobDescriptionKeywords = input.jobDescription
      .toLowerCase()
      .split(/\s+/);
    // Basic suggestion: return the keywords from the job description itself
    return jobDescriptionKeywords;
  },
});

const prompt = ai.definePrompt({
  name: 'atsKeywordOptimizationPrompt',
  input: {schema: ATSKeywordOptimizationInputSchema},
  output: {schema: ATSKeywordOptimizationOutputSchema},
  tools: [getMissingKeywords, suggestKeywords],
  prompt: `You are an AI resume optimization expert. 

Given the following resume text: 

{{resumeText}}

And the following job description:

{{jobDescription}}

Identify missing keywords from the resume based on the job description using the getMissingKeywords tool.
Suggest keywords to add to the resume based on the job description using the suggestKeywords tool.

Optimize the resume by incorporating the suggested keywords where appropriate.
`,
});

const atsKeywordOptimizationFlow = ai.defineFlow(
  {
    name: 'atsKeywordOptimizationFlow',
    inputSchema: ATSKeywordOptimizationInputSchema,
    outputSchema: ATSKeywordOptimizationOutputSchema,
  },
  async input => {
    const missingKeywords = await getMissingKeywords(input);
    const suggestedKeywords = await suggestKeywords({
      jobDescription: input.jobDescription,
    });
    const {output} = await prompt({
      ...input,
      missingKeywords,
      suggestedKeywords,
    });
    // Basic implementation: just return the original resume text.
    // In a real application, this function would use the missing and suggested
    // keywords to modify the resume text.
    return {
      optimizedResume: input.resumeText,
      missingKeywords: missingKeywords,
      suggestedKeywords: suggestedKeywords,
    };
  }
);
