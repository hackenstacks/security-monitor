
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Analyzes a single frame from a video using Gemini.
 * @param base64Image A base64 encoded string of the image frame.
 * @returns A string description of the image.
 */
export async function analyzeFrame(base64Image: string): Promise<string> {
  if (!API_KEY) {
    return Promise.reject(new Error("Gemini API key is not configured."));
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: "Analyze this security footage frame. Describe what is happening, identify any people or significant objects, and note any unusual activity. Be concise and prioritize security-relevant observations."
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
}
