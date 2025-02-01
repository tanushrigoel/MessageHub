import { streamText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";


const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("hikl")
  try {
    const prompt =
      "Create a list of threee open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These question are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. ";

    const text = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "You are a helpful assistant",
      prompt: prompt,
    });
    console.log(text)
    return text.toDataStreamResponse();
  } catch (error) {
    console.error("An unexpected error occurred", error);
    throw error;
  }
}
