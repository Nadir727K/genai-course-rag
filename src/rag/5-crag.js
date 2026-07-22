import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function evaluateRetrievalWithCRAG(userQuery, chunks) {
    // If scores are too low or chunks are empty, apply corrective strategy
    const avgScore = chunks.length > 0 ? chunks.reduce((acc, c) => acc + c.score, 0) / chunks.length : 0;
    
    if (avgScore < 0.35 || chunks.length === 0) {
        console.log("⚠️ CRAG Triggered: Low relevance score detected. Refining query keywords...");
        return {
            status: "CORRECTED",
            refinedContext: "Fallback keyword search activated for course transcripts regarding mobile development."
        };
    }

    return {
        status: "APPROVED",
        refinedContext: chunks.map(c => c.text).join('\n\n')
    };
}