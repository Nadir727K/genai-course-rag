import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';

// Initialize the Pinecone client
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

// Target the specific index name from your environment variables
const indexName = process.env.PINECONE_INDEX_NAME || 'genai-cohort-2026';

export const vectorStore = pc.index(indexName);