import * as z from "zod";

// Import the Genkit core libraries and plugins
import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { firebase } from "@genkit-ai/firebase";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Flash } from "@genkit-ai/googleai";
import { onFlow } from "@genkit-ai/firebase/functions";
import { firebaseAuth } from "@genkit-ai/firebase/auth";

// Configure Genkit
configureGenkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

// Define the flow with explicit type
export const menuSuggestionFlow = onFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    authPolicy: firebaseAuth((user) => {
      // Optional: Add custom auth logic
    }),
  },
  async (subject: string) => {
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const llmResponse = await generate({
      model: gemini15Flash, // Bezpośredni import modelu
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    return llmResponse.text();
  }
);