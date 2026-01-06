import { GoogleGenAI } from "@google/genai";

// Initialize the client strictly according to guidelines
// We assume process.env.API_KEY is available. 
// If not, the function will return a mock response or handle error gracefully.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateStandupSummary = async (previousTasks: string[], blockers: string): Promise<string> => {
  if (!apiKey) {
    return "Suggestion: Focus on completing the API integration modules and reviewing the new PRs pending from the QA team.";
  }

  try {
    const prompt = `
      You are an agile coach helper.
      Based on these finished tasks from yesterday: ${JSON.stringify(previousTasks)}
      And these current blockers: ${blockers}
      
      Generate a professional, concise "Today" plan for a daily standup meeting. 
      Keep it under 3 bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Draft: Continue working on previous sprint items.";
  }
};