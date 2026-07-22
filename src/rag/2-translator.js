import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function translateQuery(userQuery) {
    const prompt = `You are an advanced RAG query translator. Take the user query and generate:
1. "hydeDoc": A hypothetical course answer paragraph that can be used for better vector embedding lookup.
2. "subQueries": An array of 2 to 3 simplified sub-questions for thorough retrieval coverage.

User Query: "${userQuery}"

Return ONLY a JSON object with this format:
{
  "hydeDoc": "...",
  "subQueries": ["...", "..."]
}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
}