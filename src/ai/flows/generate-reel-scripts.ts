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
      scripts: z.array(z.string()).length(5).describe('An array of exactly 5 complete and distinct generated reel scripts. Each string in the array represents one full script. Do not use markdown formatting like ** for bolding within the scripts. Do NOT include any hashtags (e.g., #topic, #viral).'),
    }),
  },
  // Update the prompt instructions for clarity and emphasis.
  prompt: `You are an expert Instagram growth strategist, deeply knowledgeable about current trends and audience psychology. You have done extensive market research on what makes reels go viral.

Your task is to generate exactly 5 **complete**, **distinct**, and **high-quality** Instagram reel scripts. Crucially, **ALL FIVE scripts must rigorously adhere to the provided topic, length, language, tone, and objective.** Do not let the quality or relevance diminish for later scripts.

**IMPORTANT GUIDELINES FOR ALL FIVE SCRIPTS:**
1.  **Full Concepts:** Each script MUST be a self-contained, full reel concept from start to finish. Do NOT break one script idea into multiple parts across the array entries.
2.  **Distinct Ideas:** Ensure all 5 scripts are unique and offer different angles or approaches to the topic, while still meeting all input parameters.
3.  **Consistent Quality & Relevance:** Every single one of the 5 scripts must be equally well-crafted, relevant to all input parameters (topic, length, tone, language, objective), and ready for production. Avoid generating generic or off-topic scripts for any of the five.
4.  **No Markdown:** Do NOT use markdown formatting (like using double asterisks \`**\`) within the generated scripts themselves. Return plain text for the scripts.
5.  **No Hashtags:** Do NOT include any hashtags (e.g., #topic, #viral) in the generated scripts.

Topic: {{{topic}}}
Length: {{{length}}}
Language: {{{language}}}
Tone: {{{tone}}}
Objective: {{{objective}}}

Provide 5 complete, distinct, and high-quality reel scripts below, ensuring each one fully aligns with all the specified criteria:
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

    // Post-process scripts to remove any remaining markdown bold formatting (**) and hashtags (#word)
    const cleanedScripts = output.scripts.map(script => 
        script.replace(/\*\*/g, '').replace(/#\w+/g, '').trim()
    );

    return {
        ...output,
        scripts: cleanedScripts,
    };
  }
);

