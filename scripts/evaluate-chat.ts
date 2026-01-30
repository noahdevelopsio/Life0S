
import { Opik } from 'opik';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Initialize Opik
const opik = new Opik({
    projectName: process.env.OPIK_PROJECT_NAME || 'LifeOS',
    apiKey: process.env.OPIK_API_KEY,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const DATASET_NAME = 'LifeOS-Chat-Eval';

// Define metrics
// In a real scenario, you'd define custom metrics using LLMs to score "Tone", "Hallucination", etc.
// For this script, we'll demonstrate a simple latency/success check and log it.

async function evaluate() {
    console.log('Starting evaluation...');

    // 1. Create or Get Dataset
    // Code to create dataset if not exists... (Simplified for script)
    const testCases = [
        { input: "I'm feeling overwhelmed today.", expectedTopic: "Support/Mental Health" },
        { input: "Track my run of 5km.", expectedTopic: "Fitness" },
        { input: "What goals do I have?", expectedTopic: "Goals context" },
    ];

    for (const testCase of testCases) {
        console.log(`Testing: "${testCase.input}"`);
        const start = Date.now();

        // Call Gemini directly (mocking the app's logic)
        const result = await model.generateContent(testCase.input);
        const response = result.response.text();
        const duration = Date.now() - start;

        console.log(`Response: ${response.substring(0, 50)}... (${duration}ms)`);

        // Log trace to Opik
        const trace = opik.trace({
            name: 'eval-run',
            input: { message: testCase.input },
            output: { response },
            metadata: { duration, expected: testCase.expectedTopic }
        });

        // Here you would normally run scoring functions
        // e.g. score = llm_judge(response, testCase.expectedTopic)
        // trace.logMetric("relevance_score", score)

        // trace.end(); // Auto-handled if using correct SDK patterns or explicit end
    }

    console.log('Evaluation complete. Check Opik dashboard.');
}

evaluate().catch(console.error);
