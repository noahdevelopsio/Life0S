import { opik } from './client';

// Gemini pricing (approximate, per 1M tokens)
const GEMINI_PRICING = {
    'gemini-2.5-flash-lite': {
        input: 0.075,   // $0.075 per 1M input tokens
        output: 0.30,   // $0.30 per 1M output tokens
    },
    'gemini-2.5-flash': {
        input: 0.15,
        output: 0.60,
    },
};

/**
 * Track performance metrics for an AI operation
 */
export async function trackPerformanceMetrics(
    traceId: string,
    operation: string,
    metrics: {
        duration: number;
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
        model?: string;
    }
) {
    const model = metrics.model || 'gemini-2.5-flash-lite';
    const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING] || GEMINI_PRICING['gemini-2.5-flash-lite'];

    const inputTokens = metrics.inputTokens || 0;
    const outputTokens = metrics.outputTokens || 0;
    const totalTokens = metrics.totalTokens || (inputTokens + outputTokens);

    // Calculate estimated cost
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    const totalCost = inputCost + outputCost;

    // Calculate tokens per second (throughput)
    const tokensPerSecond = totalTokens / (metrics.duration / 1000);

    await opik.span({
        traceId,
        name: 'performance-metrics',
        metadata: {
            operation,
            duration_ms: metrics.duration,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: totalTokens,
            estimated_cost_usd: totalCost.toFixed(6),
            tokens_per_second: tokensPerSecond.toFixed(2),
            model,
            timestamp: new Date().toISOString(),
        },
    });

    // Alert if slow (> 5 seconds)
    if (metrics.duration > 5000) {
        await opik.log({
            name: 'performance-alert',
            properties: {
                severity: 'warning',
                operation,
                duration_ms: metrics.duration,
                threshold_ms: 5000,
                message: `${operation} took ${metrics.duration}ms (exceeds 5s threshold)`,
            },
        });
    }

    // Alert if expensive (> $0.01 per call)
    if (totalCost > 0.01) {
        await opik.log({
            name: 'cost-alert',
            properties: {
                severity: 'info',
                operation,
                estimated_cost_usd: totalCost.toFixed(6),
                total_tokens: totalTokens,
                message: `${operation} cost $${totalCost.toFixed(4)} (${totalTokens} tokens)`,
            },
        });
    }

    return {
        duration: metrics.duration,
        totalTokens,
        estimatedCost: totalCost,
        tokensPerSecond,
    };
}

/**
 * Create a performance summary for a batch of operations
 */
export async function trackBatchPerformance(
    operations: Array<{
        traceId: string;
        operation: string;
        duration: number;
        tokens: number;
    }>
) {
    const totalDuration = operations.reduce((sum, op) => sum + op.duration, 0);
    const totalTokens = operations.reduce((sum, op) => sum + op.tokens, 0);
    const avgDuration = totalDuration / operations.length;
    const avgTokens = totalTokens / operations.length;

    await opik.log({
        name: 'batch-performance-summary',
        properties: {
            operation_count: operations.length,
            total_duration_ms: totalDuration,
            total_tokens: totalTokens,
            avg_duration_ms: avgDuration.toFixed(2),
            avg_tokens: avgTokens.toFixed(2),
            timestamp: new Date().toISOString(),
        },
    });

    return {
        operationCount: operations.length,
        totalDuration,
        totalTokens,
        avgDuration,
        avgTokens,
    };
}
