import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();




const genAI = new GoogleGenerativeAI("AIzaSyDw8d4dh-nrQU1sT9WJULHTfz85tG2nWKk");

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-05-20',
});


export async function generateFromUserInput(prompt) {
  if (!prompt || prompt.trim() === "") {
    return "Prompt cannot be empty.";
  }
  const promptExecution = `You are a helpful AI assistant. ${prompt}`;
  try {
    const result = await model.generateContent(promptExecution);
    const response = await result.response;
    const text = response.text().trim();
    console.log("generated response", text);
    return text;
  } catch (err) {
    console.error("Error generating response:", err);
    return "Something went wrong ";
  }
}


