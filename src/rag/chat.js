import 'dotenv/config';
import { runGuardrails } from './1-guardrails.js';
import { translateQuery } from './2-translator.js';
import { routeQuery } from './3-router.js';
import { retrieveChunks } from './4-retriever.js';
import { evaluateRetrievalWithCRAG } from './5-crag.js';
import { generateResponse } from './6-generator.js';

export async function handleUserMessage(userQuery) {
    console.log(`\n💬 Processing query: "${userQuery}"`);

    // Step 1: Guardrails
    const guardrailCheck = await runGuardrails(userQuery);
    if (!guardrailCheck.safe) {
        return `🚫 Guardrail Blocked: ${guardrailCheck.reason}`;
    }

    // Step 2: Query Routing
    const routing = await routeQuery(userQuery);
    if (routing.target === 'auth-db') {
        return `🔐 Auth Database Query Routed: Executing SQL -> ${routing.sqlQuery}`;
    }

    // Step 3: Query Translation (HyDE & Sub-queries)
    const translation = await translateQuery(userQuery);
    
    // Step 4: Retrieval using HyDE document representation
    const chunks = await retrieveChunks(translation.hydeDoc, 5);

    // Step 5: CRAG Evaluation
    const cragResult = await evaluateRetrievalWithCRAG(userQuery, chunks);

    // Step 6: Generation
    const finalAnswer = await generateResponse(userQuery, cragResult.refinedContext);
    return finalAnswer;
}

// Test runner if executed directly
if (process.argv[2]) {
    handleUserMessage(process.argv.slice(2).join(' '))
        .then(ans => console.log("\n🤖 Final Output:\n", ans))
        .catch(console.error);
}