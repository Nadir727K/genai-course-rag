import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateResponse(userQuery, contextText) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are an expert AI teaching assistant for a mobile development course. Answer the user accurately using ONLY the provided context."
            },
            {
                role: "user",
                content: `Context:\n${contextText}\n\nQuestion: ${userQuery}`
            }
        ],
        temperature: 0.3,
    });

    return completion.choices[0].message.content;
}