import { GoogleGenAI } from "@google/genai";

// Initialize the client strictly according to guidelines
// We assume process.env.API_KEY is available. 
// If not, the function will return a mock response or handle error gracefully.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; 
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

export const generateWeeklySummary = async (standups: { name: string, date: string, yesterday: string, today: string, blockers: string }[]): Promise<string> => {
  if (!apiKey) {
    return "Weekly Summary Preview: Access to the Gemini API is required to generate a comprehensive weekly report. Please ensure your API key is configured correctly.";
  }

  try {
    const dataStr = standups.map(s => 
      `- ${s.name} (${new Date(s.date).toLocaleDateString()}): Yesterday: ${s.yesterday}, Today: ${s.today}, Blockers: ${s.blockers}`
    ).join('\n');

    const prompt = `
      You are a Project Manager Assistant.
      Here are the daily standup updates from the team for this week:
      
      ${dataStr}

      Please provide a concise Weekly Summary (max 150 words) highlighting:
      1. Key achievements (What was done).
      2. Major blockers identified (and if they persist).
      3. Overall team sentiment/progress.
      
      Format with clear headings or bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate weekly summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary. Please try again later.";
  }
};