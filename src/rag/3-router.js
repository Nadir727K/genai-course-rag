import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function routeQuery(userQuery) {
    const prompt = `Determine which data source should handle the user's query.
- Choose "vector-store" for course content, lessons, transcripts, Expo, React Native, or mobile development technical concepts.
- Choose "auth-db" for user account details, subscriptions, profile settings, or credentials.

User Query: "${userQuery}"

Return ONLY a JSON object:
{
  "target": "vector-store" or "auth-db",
  "sqlQuery": "Generated SQL query if auth-db, otherwise null"
}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
}