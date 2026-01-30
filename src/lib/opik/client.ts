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

// Safe wrapper for Opik client
const safeOpik = {
    trace: async (...args: any[]) => {
        if (!opikClient) return;
        try {
            return await (opikClient as any).trace(...args);
        } catch (e) {
            // Silently fail if Opik is not configured or errors
        }
    },
    span: async (...args: any[]) => {
        if (!opikClient) return;
        try {
            return await (opikClient as any).span(...args);
        } catch (e) {
            // Silently fail
        }
    },
    score: async (...args: any[]) => {
        if (!opikClient) return;
        try {
            return await (opikClient as any).score(...args);
        } catch (e) {
            // Silently fail
        }
    },
    log: async (...args: any[]) => {
        if (!opikClient) return;
        try {
            return await (opikClient as any).log(...args);
        } catch (e) {
            // Silently fail
        }
    },
} as any;

export const opik = safeOpik;

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
export async function trackLLMCall(
    params: {
        input: any[];
        output: string;
        model?: string;
        metadata?: Record<string, any>;
        tags?: string[];
    }
) {
    // Console log for local verification since we can't see Opik dashboard
    if (process.env.NODE_ENV === 'development') {
        console.log('[Opik] Tracking LLM Call:', {
            input: params.input.length > 0 ? `${params.input.length} messages` : 'Empty input',
            outputPreview: params.output.substring(0, 50) + (params.output.length > 50 ? '...' : ''),
            model: params.model
        });
    }

    await opik.log({
        name: 'llm_call',
        input: { messages: params.input },
        output: { content: params.output },
        properties: {
            model: params.model || 'gemini-2.5-flash-lite',
            timestamp: new Date().toISOString(),
            ...params.metadata,
        },
        tags: params.tags
    });
}
