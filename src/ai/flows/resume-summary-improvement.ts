'use server';
/**
 * @fileOverview This file defines a Genkit flow for improving the summary section of a resume.
 *
 * - improveResumeSummary - A function that provides suggestions to improve the resume summary.
 * - ResumeSummaryImprovementInput - The input type for the improveResumeSummary function.
 * - ResumeSummaryImprovementOutput - The return type for the improveResumeSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeSummaryImprovementInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be improved.'),
});
export type ResumeSummaryImprovementInput = z.infer<
  typeof ResumeSummaryImprovementInputSchema
>;

const ResumeSummaryImprovementOutputSchema = z.object({
  improvedSummary: z
    .string()
    .describe('The suggested improved summary for the resume.'),
});
export type ResumeSummaryImprovementOutput = z.infer<
  typeof ResumeSummaryImprovementOutputSchema
>;

export async function improveResumeSummary(
  input: ResumeSummaryImprovementInput
): Promise<ResumeSummaryImprovementOutput> {
  return resumeSummaryImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeSummaryImprovementPrompt',
  input: {schema: ResumeSummaryImprovementInputSchema},
  output: {schema: ResumeSummaryImprovementOutputSchema},
  prompt: `You are an expert resume writer. Your task is to improve the summary section of the given resume.

Resume Text:
{{{resumeText}}}

Analyze the summary section (often the first paragraph) and rewrite it to be more impactful, concise, and tailored for grabbing a recruiter's attention. If no clear summary exists, create one based on the overall content of the resume.

Return the improved summary in the 'improvedSummary' field.`,
});

const resumeSummaryImprovementFlow = ai.defineFlow(
  {
    name: 'resumeSummaryImprovementFlow',
    inputSchema: ResumeSummaryImprovementInputSchema,
    outputSchema: ResumeSummaryImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
