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

const GenerateReelScriptsOutputSchema = z.object({
  scripts: z.array(z.string()).describe('An array of 5 generated reel scripts.'),
});
export type GenerateReelScriptsOutput = z.infer<typeof GenerateReelScriptsOutputSchema>;

export async function generateReelScripts(input: GenerateReelScriptsInput): Promise<GenerateReelScriptsOutput> {
  return generateReelScriptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReelScriptsPrompt',
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
    schema: z.object({
      scripts: z.array(z.string()).describe('An array of 5 generated reel scripts.'),
    }),
  },
  prompt: `You are an expert Instagram growth consultant, up to date with the latest trends and deeply researched in the psychology of people.

You will generate 5 viral-worthy Instagram reel scripts based on the topic, length, language, tone, and objective provided. Each script should be unique and designed to engage viewers and encourage action.

Topic: {{{topic}}}
Length: {{{length}}}
Language: {{{language}}}
Tone: {{{tone}}}
Objective: {{{objective}}}

Here are the 5 reel scripts:
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
    return output!;
  }
);
