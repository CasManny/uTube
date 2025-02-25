import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const geminiAIModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
export const geminiAIImageModel = genAI.getGenerativeModel({
  model: "imagen-3.0-generate-002",
});
