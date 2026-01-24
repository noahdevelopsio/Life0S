import { Opik } from 'opik';
import { chatWithGemini } from '@/lib/ai/gemini';

// Initialize Opik only if API key is present to avoid errors during build/dev without keys
// In a real app we might want strict checks
const opikClient = process.env.OPIK_API_KEY
    ? new Opik({
        apiKey: process.env.OPIK_API_KEY!,
        projectName: process.env.OPIK_PROJECT_NAME || 'lifeos',
    })
    : null; // Graceful fallback if not configured

export const opik = opikClient || {
    // Mock interface so code doesn't break if opik is missing
    trace: async () => { },
    span: async () => { },
    score: async () => { },
    log: async () => { },
} as any;

// Wrapper for Gemini calls with Opik logging
export async function geminiWithOpik(
    operationName: string,
    messages: any[],
    systemInstruction: string,
    metadata?: Record<string, any>
) {
    const startTime = Date.now();
    const traceId = crypto.randomUUID();

    // Start Opik trace
    await opik.trace({
        id: traceId,
        name: operationName,
        input: {
            messages,
            systemInstruction,
            model: 'gemini-1.5-pro'
        },
        metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
        },
    });

    try {
        const response = await chatWithGemini(messages, systemInstruction);
        const duration = Date.now() - startTime;

        // Log successful completion
        await opik.span({
            traceId,
            name: `\${operationName}-completion`,
            input: messages[messages.length - 1],
            output: response,
            metadata: {
                duration,
                success: true,
                tokensEstimate: response.content.length / 4,
            },
        });

        return response;
    } catch (error: any) {
        // Log error
        await opik.span({
            traceId,
            name: `\${operationName}-error`,
            metadata: {
                error: error.message,
                success: false,
            },
        });
        throw error;
    }
}

export async function trackFeatureUsage(
    featureName: string,
    userId: string,
    metadata?: Record<string, any>
) {
    await opik.log({
        name: 'feature_usage',
        properties: {
            feature: featureName,
            userId,
            timestamp: new Date().toISOString(),
            ...metadata,
        },
    });
}

export async function trackGoalMilestone(
    userId: string,
    goalId: string,
    milestone: string
) {
    await opik.log({
        name: 'goal_milestone',
        properties: {
            userId,
            goalId,
            milestone,
            timestamp: new Date().toISOString(),
        },
    });
}
