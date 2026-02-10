import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeData } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check API key
export const checkApiKey = () => {
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return false;
  }
  return true;
};

export const generateResumeSummary = async (resume: ResumeData): Promise<string> => {
  if (!checkApiKey()) return "API Key missing";

  const prompt = `
    Based on the following professional experience and skills, write a compelling, professional summary (3-4 sentences) for a resume.
    
    Experience: ${resume.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n')}
    Skills: ${resume.skills.join(', ')}
    
    Keep it impactful, ATS-friendly, and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary. Please try again.";
  }
};

export const enhanceDescription = async (text: string): Promise<string> => {
  if (!checkApiKey()) return text;

  const prompt = `
    Rewrite the following resume bullet point to be more professional, action-oriented, and impactful. 
    Use strong action verbs and quantify results if implied. Keep it concise.
    
    Original: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Error enhancing text:", error);
    return text;
  }
};

export const analyzeJobMatch = async (resume: ResumeData, jobDescription: string) => {
  if (!checkApiKey()) throw new Error("API Key missing");

  const resumeText = JSON.stringify(resume);
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Compatibility score from 0 to 100" },
      missingKeywords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of important keywords from the job description missing in the resume"
      },
      suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Actionable advice to improve the resume for this specific job"
      },
      summary: { type: Type.STRING, description: "A brief analysis summary" }
    },
    required: ["score", "missingKeywords", "suggestions", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for deeper reasoning
      contents: `
        Analyze the compatibility between this resume and the job description.
        
        Resume: ${resumeText}
        
        Job Description: ${jobDescription}
        
        Provide a compatibility score, missing keywords, and specific suggestions.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing job match:", error);
    throw error;
  }
};

export const createInterviewChat = (jobDescription: string) => {
  if (!checkApiKey()) throw new Error("API Key missing");

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a professional hiring manager interviewing a candidate for a job with the following description: "${jobDescription.slice(0, 1000)}...". 
      Start by asking a relevant question. Wait for the user's response. 
      After the user responds, briefly evaluate their answer (constructive feedback), then ask the next question. 
      Keep the tone professional but encouraging.`
    }
  });
};
