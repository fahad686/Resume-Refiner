'use server';
/**
 * @fileOverview This file defines a Genkit flow for improving the work experience section of a resume.
 *
 * - improveExperience - A function that provides suggestions to improve the work experience bullet points.
 * - ExperienceImprovementInput - The input type for the improveExperience function.
 * - ExperienceImprovementOutput - The return type for the improveExperience function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExperienceImprovementInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be improved.'),
});
export type ExperienceImprovementInput = z.infer<
  typeof ExperienceImprovementInputSchema
>;

const ExperienceImprovementOutputSchema = z.object({
  improvedExperience: z
    .string()
    .describe('The suggested improved work experience section for the resume.'),
});
export type ExperienceImprovementOutput = z.infer<
  typeof ExperienceImprovementOutputSchema
>;

export async function improveExperience(
  input: ExperienceImprovementInput
): Promise<ExperienceImprovementOutput> {
  return experienceImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'experienceImprovementPrompt',
  input: {schema: ExperienceImprovementInputSchema},
  output: {schema: ExperienceImprovementOutputSchema},
  prompt: `You are an expert career coach. Your task is to improve the work experience section of the given resume.

Resume Text:
{{{resumeText}}}

Analyze the work experience section. Rewrite the bullet points to be more impactful. Use strong action verbs, quantify achievements where possible (even with estimates if necessary), and focus on results rather than just responsibilities.

Return the entire rewritten work experience section in the 'improvedExperience' field.`,
});

const experienceImprovementFlow = ai.defineFlow(
  {
    name: 'experienceImprovementFlow',
    inputSchema: ExperienceImprovementInputSchema,
    outputSchema: ExperienceImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
