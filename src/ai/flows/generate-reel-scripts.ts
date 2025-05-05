
'use server';
/**
 * @fileOverview Generates Instagram reel scripts based on user-defined criteria.
 *
 * - generateReelScripts - A function to generate reel scripts.
 * - GenerateReelScriptsInput - The input type for the generateReelScripts function.
 * - GenerateReelScriptsOutput - The return type for the generateReelScripts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateReelScriptsInputSchema = z.object({
  topic: z.string().describe('The topic of the reel.'),
  length: z.enum(['15s', '30s', '60s', '90s']).describe('The length of the reel.'),
  language: z
    .string()
    .describe('The language of the reel script. Example: English, Hindi, Marathi.'),
  tone: z.string().describe('The tone of the reel script. Example: Humorous, Motivational, Educational.'),
  objective: z
    .string()
    .describe('The objective of the reel. Example: Increase brand awareness, drive sales, educate audience.'),
});
export type GenerateReelScriptsInput = z.infer<typeof GenerateReelScriptsInputSchema>;

// Ensure the output schema expects an array of strings, where each string is a complete script.
const GenerateReelScriptsOutputSchema = z.object({
  scripts: z.array(z.string()).length(5).describe('An array of exactly 5 complete and distinct generated reel scripts.'),
});
export type GenerateReelScriptsOutput = z.infer<typeof GenerateReelScriptsOutputSchema>;

export async function generateReelScripts(input: GenerateReelScriptsInput): Promise<GenerateReelScriptsOutput> {
  return generateReelScriptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReelScriptsPrompt',
  model: 'googleai/gemini-1.5-flash', // Specify the model to use
  input: {
    schema: z.object({
      topic: z.string().describe('The topic of the reel.'),
      length: z.string().describe('The length of the reel (15s, 30s, 60s, 90s).'),
      language: z.string().describe('The language of the reel script.'),
      tone: z.string().describe('The tone of the reel script.'),
      objective: z.string().describe('The objective of the reel.'),
    }),
  },
  output: {
    // The schema description guides the model's output format.
    schema: z.object({
      scripts: z.array(z.string()).length(5).describe('An array of exactly 5 complete and distinct generated reel scripts. Each string in the array represents one full script.'),
    }),
  },
  // Update the prompt instructions for clarity and emphasis.
  prompt: `You are an expert Instagram growth strategist, deeply knowledgeable about current trends and audience psychology. You have done extensive market research on what makes reels go viral.

You MUST generate exactly 5 **complete** and **unique** Instagram reel scripts based on the topic, length, language, tone, and objective provided.

**IMPORTANT:** Each script in the output array MUST be a self-contained, full reel concept from start to finish. Do NOT break one script idea into multiple parts across the array entries. Ensure you provide exactly 5 distinct scripts.

Topic: {{{topic}}}
Length: {{{length}}}
Language: {{{language}}}
Tone: {{{tone}}}
Objective: {{{objective}}}

Here are the 5 complete and unique reel scripts, meticulously crafted for impact:
`,
});


const generateReelScriptsFlow = ai.defineFlow<
  typeof GenerateReelScriptsInputSchema,
  typeof GenerateReelScriptsOutputSchema
>(
  {
    name: 'generateReelScriptsFlow',
    inputSchema: GenerateReelScriptsInputSchema,
    outputSchema: GenerateReelScriptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The generation process failed to produce an output.");
    }
    // Add a check to ensure exactly 5 scripts are returned, although Zod schema handles this too.
    if (!output.scripts || output.scripts.length !== 5) {
        console.warn("Generated output did not contain exactly 5 scripts. Received:", output.scripts?.length);
        // Optionally, you could throw an error or try to handle this (e.g., retry)
        // For now, we'll let it pass but the warning helps debugging.
        // throw new Error("Generation did not return the expected 5 scripts.");
    }
    return output;
  }
);
