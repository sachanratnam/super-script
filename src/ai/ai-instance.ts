import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure the API key is not hardcoded and is read from environment variables.
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  // Throw an error during initialization if the key is missing.
  // This prevents the application from trying to make API calls without a valid key.
  throw new Error(
    "GOOGLE_GENAI_API_KEY environment variable is not set. Please provide a valid API key in your .env file."
  );
}


export const ai = genkit({
  promptDir: './prompts', // Note: promptDir is not a standard Genkit v1 option, consider removing if not used.
  plugins: [
    googleAI({
      // Read API key from environment variable
      apiKey: apiKey, // Pass the validated API key
    }),
  ],
  // model: 'googleai/gemini-pro', // Removing default model from top level, specify in prompt/generate calls
});
