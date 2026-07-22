import 'dotenv/config';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

export async function retrieveChunks(searchQuery, topK = 5) {
    const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: searchQuery,
    });

    const queryResponse = await index.query({
        vector: embeddingRes.data[0].embedding,
        topK: topK,
        includeMetadata: true,
    });
    console.log("\n📄 [Source Verification] Retrieved Chunks from Pinecone:");
    queryResponse.matches.forEach((m, idx) => {
        console.log(`  [${idx + 1}] Lesson: ${m.metadata.lessonName} (${m.metadata.startTime}s - ${m.metadata.endTime}s) | Score: ${m.score}`);
    });

    return queryResponse.matches.map(m => ({
        id: m.id,
        score: m.score,
        text: m.metadata.text,
        lessonName: m.metadata.lessonName,
        startTime: m.metadata.startTime,
        endTime: m.metadata.endTime
    }));
}