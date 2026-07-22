import 'dotenv/config'; 
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { processTranscripts } from './parser.js';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
    throw new Error("❌ Missing environment variables. Ensure OPENAI_API_KEY, PINECONE_API_KEY, and PINECONE_INDEX_NAME are in your .env file.");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});
const index = pc.index(process.env.PINECONE_INDEX_NAME);

const PROGRESS_FILE = './data/transcripts/progress.json';

function createOverlappingChunks(cues, windowSize = 6, overlap = 2) {
    const chunks = [];
    for (let i = 0; i < cues.length; i += (windowSize - overlap)) {
        const window = cues.slice(i, i + windowSize);
        if (window.length === 0) break;
        
        const mergedText = window.map(c => c.text).join(' ');
        const baseId = window[0].lessonName || `chunk`;
        
        chunks.push({
            id: `${baseId}-${i}`, 
            lessonName: window[0].lessonName || "Unknown Lesson",
            startTime: window[0].startTime || 0,
            endTime: window[window.length - 1].endTime || 0,
            text: mergedText
        });
    }
    return chunks;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function runIngestionPipeline() {
    console.log('🚀 Starting OpenAI -> Pinecone Pipeline...');
    
    const rawCues = await processTranscripts('./data/transcripts');
    const chunks = createOverlappingChunks(rawCues);
    console.log(`📦 Created ${chunks.length} chunks.`);

    let startIndex = 0;
    try {
        const progress = JSON.parse(await fs.readFile(PROGRESS_FILE, 'utf-8'));
        startIndex = progress.lastProcessedIndex || 0;
        if (startIndex > 0) console.log(`🔄 Resuming from chunk ${startIndex}...`);
    } catch (e) {
        console.log('📄 No previous progress found. Starting from the beginning.');
    }

    const batchSize = 100; 
    
    for (let i = startIndex; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const textsToEmbed = batch.map(chunk => chunk.text);
        
        let success = false;
        let retries = 3;

        while (!success && retries > 0) {
            try {
                const response = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: textsToEmbed,
                });

                if (!response.data || response.data.length === 0) {
                    throw new Error("OpenAI returned an empty embeddings array.");
                }

                const pineconeVectors = batch.map((chunk, index) => {
                    const embeddingVector = response.data[index].embedding;
                    
                    if (!embeddingVector || !Array.isArray(embeddingVector)) {
                        throw new Error(`Invalid vector at index ${index}`);
                    }

                    return {
                        id: chunk.id,
                        values: embeddingVector, 
                        metadata: {
                            lessonName: chunk.lessonName,
                            startTime: chunk.startTime,
                            endTime: chunk.endTime,
                            text: chunk.text
                        }
                    };
                });

                // Correct object wrapper structure required by the modern Pinecone SDK
                await index.upsert({ vectors: pineconeVectors });
                
                await fs.writeFile(PROGRESS_FILE, JSON.stringify({ lastProcessedIndex: i + batchSize }));
                
                const currentBatchNumber = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(chunks.length / batchSize);
                console.log(`✅ Upserted batch ${currentBatchNumber} of ${totalBatches}`);
                
                success = true; 

                if (i + batchSize < chunks.length) await sleep(1000);
                
            } catch (error) {
                console.warn(`⚠️ Batch failed. Error: ${error.message}`);
                console.log(`Retrying in 5s... (${retries} retries left)`);
                await sleep(5000);
                retries--;
                if (retries === 0) throw new Error("Pipeline aborted after multiple failures.");
            }
        }
    }
    
    console.log('🎉 OpenAI Ingestion Pipeline 100% Complete!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runIngestionPipeline().catch(console.error);
}