import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure the API key is not hardcoded and is read from environment variables.
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.warn(
    'GOOGLE_GENAI_API_KEY environment variable not set. Genkit features requiring this key may fail.'
  );
  // Optionally, throw an error if the key is absolutely required for the app to function
  // throw new Error("GOOGLE_GENAI_API_KEY environment variable is not set.");
}


export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      // Read API key from environment variable
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
