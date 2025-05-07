
'use server';
/**
 * @fileOverview Refines an existing Instagram reel script based on user-defined criteria.
 *
 * - refineScript - A function to refine a reel script.
 * - RefineScriptInput - The input type for the refineScript function.
 * - RefineScriptOutput - The return type for the refineScript function.
 */

import {ai} from '@/ai/ai-instance';
import {z}from 'genkit';

const RefineScriptInputSchema = z.object({
  originalScript: z.string().describe('The original reel script content to be refined.'),
  topic: z.string().describe('The original topic of the reel, for context.'),
  length: z.enum(['15s', '30s', '60s', '90s']).describe('The original target length of the reel, for context.'),
  language: z.string().describe('The language of the original script, for context.'),
  originalTone: z.string().describe('The original tone of the script, for context.'),
  objective: z.string().describe('The original objective of the reel, for context.'),
  refinementGoal: z.string().describe('The primary goal for refining the script. This should be a descriptive instruction, e.g., "Make the script more concise", "Change the tone to humorous", "Enhance the Call to Action to encourage website visits and specify the website is example.com".'),
});
export type RefineScriptInput = z.infer<typeof RefineScriptInputSchema>;

const RefineScriptOutputSchema = z.object({
  refinedScript: z.string().describe('The refined reel script, ensuring no markdown like ** is used.'),
});
export type RefineScriptOutput = z.infer<typeof RefineScriptOutputSchema>;

export async function refineScript(input: RefineScriptInput): Promise<RefineScriptOutput> {
  return refineScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineReelScriptPrompt',
  model: 'googleai/gemini-1.5-flash', // Specify the model to use
  input: {
    schema: RefineScriptInputSchema,
  },
  output: {
    schema: RefineScriptOutputSchema,
  },
  prompt: `You are an expert Instagram script editor. Your task is to refine the provided reel script based on the user's refinement goal, while respecting the original context (topic, length, language, tone, objective).

Original Script:
{{{originalScript}}}

Original Context:
- Topic: {{{topic}}}
- Length: {{{length}}}
- Language: {{{language}}}
- Original Tone: {{{originalTone}}}
- Objective: {{{objective}}}

Refinement Goal: {{{refinementGoal}}}

Please provide the refined script below. Ensure the refined script is a complete piece of text and does not use any markdown formatting (like ** for bolding).
The refined script should still be suitable for the original length constraint unless the refinement goal explicitly asks to change it (e.g. "Make it shorter", "Make it longer").
If the goal is to change the tone, ensure the new tone is applied effectively.
If the goal is to enhance the CTA, make it compelling and clear.
`,
});

const refineScriptFlow = ai.defineFlow<
  typeof RefineScriptInputSchema,
  typeof RefineScriptOutputSchema
>(
  {
    name: 'refineScriptFlow',
    inputSchema: RefineScriptInputSchema,
    outputSchema: RefineScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.refinedScript) {
      throw new Error('The refinement process failed to produce a script.');
    }
     // Post-process script to remove any remaining markdown bold formatting (**)
    const cleanedScript = output.refinedScript.replace(/\*\*/g, '');
    return { refinedScript: cleanedScript };
  }
);
