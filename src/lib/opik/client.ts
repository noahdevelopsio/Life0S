import { Opik } from 'opik';

// Initialize Opik only if API key is present to avoid errors during build/dev without keys
const opikClient = process.env.OPIK_API_KEY
    ? new Opik({
        apiKey: process.env.OPIK_API_KEY!,
        projectName: process.env.OPIK_PROJECT_NAME || 'lifeos',
    })
    : null;

// Helper: Generate unique trace IDs
export function generateTraceId(): string {
    return `lifeos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Get user metadata for traces
export function getUserMetadata(userId: string, additionalData?: Record<string, any>) {
    return {
        userId,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        ...additionalData,
    };
}

// Safe wrapper for Opik client - silently fails if not configured
const safeOpik = {
    trace: async (params: any) => {
        if (!opikClient) return null;
        try {
            return await (opikClient as any).trace(params);
        } catch (e) {
            console.error('[Opik] trace error:', e);
            return null;
        }
    },
    span: async (params: any) => {
        if (!opikClient) return null;
        try {
            return await (opikClient as any).span(params);
        } catch (e) {
            console.error('[Opik] span error:', e);
            return null;
        }
    },
    score: async (params: any) => {
        if (!opikClient) return null;
        try {
            return await (opikClient as any).score(params);
        } catch (e) {
            console.error('[Opik] score error:', e);
            return null;
        }
    },
    log: async (params: any) => {
        if (!opikClient) return null;
        try {
            return await (opikClient as any).log(params);
        } catch (e) {
            console.error('[Opik] log error:', e);
            return null;
        }
    },
    feedback: async (params: { traceId: string; score: number; metadata?: Record<string, any> }) => {
        if (!opikClient) return null;
        try {
            // Opik feedback is typically sent as a score with specific name
            return await (opikClient as any).score({
                traceId: params.traceId,
                name: 'user_feedback',
                value: params.score,
                metadata: params.metadata,
            });
        } catch (e) {
            console.error('[Opik] feedback error:', e);
            return null;
        }
    },
};

export const opik = safeOpik;

// Export raw client for advanced usage (if needed)
export const rawOpikClient = opikClient;

// ============================================================
// Tracking Helpers
// ============================================================

export async function trackFeatureUsage(
    featureName: string,
    userId: string,
    metadata?: Record<string, any>
) {
    await opik.log({
        name: 'feature_usage',
        properties: {
            feature: featureName,
            ...getUserMetadata(userId, metadata),
        },
    });
}

export async function trackGoalMilestone(
    userId: string,
    goalId: string,
    milestone: string,
    aiInteractionsLast7Days?: number
) {
    await opik.log({
        name: 'goal_milestone',
        properties: {
            goalId,
            milestone,
            ai_interactions_last_7days: aiInteractionsLast7Days,
            ...getUserMetadata(userId),
        },
    });
}

export async function trackLLMCall(params: {
    traceId?: string;
    input: any[];
    output: string;
    model?: string;
    duration?: number;
    metadata?: Record<string, any>;
    tags?: string[];
}) {
    const traceId = params.traceId || generateTraceId();

    if (process.env.NODE_ENV === 'development') {
        console.log('[Opik] Tracking LLM Call:', {
            traceId,
            input: params.input.length > 0 ? `${params.input.length} messages` : 'Empty input',
            outputPreview: params.output.substring(0, 50) + (params.output.length > 50 ? '...' : ''),
            model: params.model,
            duration: params.duration ? `${params.duration}ms` : 'N/A',
        });
    }

    await opik.log({
        name: 'llm_call',
        input: { messages: params.input },
        output: { content: params.output },
        properties: {
            traceId,
            model: params.model || 'gemini-2.5-flash-lite',
            duration_ms: params.duration,
            timestamp: new Date().toISOString(),
            ...params.metadata,
        },
        tags: params.tags,
    });

    return traceId;
}

