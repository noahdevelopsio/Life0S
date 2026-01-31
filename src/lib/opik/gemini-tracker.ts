import { opik, generateTraceId, getUserMetadata } from './client';
import { chatWithGemini, streamGemini, geminiJSON, GeminiMessage } from '@/lib/ai/gemini';

type TrackingMetadata = {
    userId: string;
    feature: string;
    [key: string]: any;
};

/**
 * Wrapper for standard Gemini chat calls with Opik tracking
 */
export async function trackedGeminiCall(
    operationName: string,
    messages: GeminiMessage[],
    systemInstruction: string,
    metadata: TrackingMetadata
) {
    const traceId = generateTraceId();
    const startTime = Date.now();

    try {
        // Start Opik trace
        await opik.trace({
            id: traceId,
            name: operationName,
            input: {
                messages,
                systemInstruction: systemInstruction.substring(0, 200) + '...',
                model: 'gemini-2.5-flash-lite',
            },
            metadata: getUserMetadata(metadata.userId, metadata),
        });

        // Call Gemini
        const response = await chatWithGemini(messages, systemInstruction);
        const duration = Date.now() - startTime;

        // Estimate tokens (rough approximation: ~4 chars per token)
        const inputTokens = JSON.stringify(messages).length / 4;
        const outputTokens = response.content.length / 4;
        const totalTokens = inputTokens + outputTokens;

        // Log completion span
        await opik.span({
            traceId,
            name: `${operationName}-completion`,
            input: messages[messages.length - 1],
            output: response.content,
            metadata: {
                duration_ms: duration,
                input_tokens_estimate: Math.round(inputTokens),
                output_tokens_estimate: Math.round(outputTokens),
                total_tokens_estimate: Math.round(totalTokens),
                model: 'gemini-2.5-flash-lite',
                success: true,
            },
        });

        return {
            response: response.content,
            traceId,
            duration,
            totalTokens: Math.round(totalTokens)
        };
    } catch (error: any) {
        const duration = Date.now() - startTime;

        // Log error span
        await opik.span({
            traceId,
            name: `${operationName}-error`,
            metadata: {
                error: error.message,
                errorType: error.constructor?.name || 'Error',
                duration_ms: duration,
                success: false,
            },
        });

        throw error;
    }
}

/**
 * Wrapper for streaming Gemini calls with Opik tracking
 */
export async function trackedGeminiStream(
    operationName: string,
    messages: { role: string; content: string }[],
    systemInstruction: string,
    onChunk: (chunk: string) => void,
    metadata: TrackingMetadata
): Promise<{ fullResponse: string; traceId: string; duration: number; totalTokens: number }> {
    const traceId = generateTraceId();
    const startTime = Date.now();
    let fullResponse = '';

    try {
        // Start Opik trace
        await opik.trace({
            id: traceId,
            name: operationName,
            input: {
                messages,
                messageCount: messages.length,
            },
            metadata: getUserMetadata(metadata.userId, {
                ...metadata,
                streaming: true,
            }),
        });

        // Stream Gemini response
        await streamGemini(messages, systemInstruction, (chunk) => {
            fullResponse += chunk;
            onChunk(chunk);
        });

        const duration = Date.now() - startTime;
        const inputTokens = JSON.stringify(messages).length / 4;
        const outputTokens = fullResponse.length / 4;
        const totalTokens = Math.round(inputTokens + outputTokens);

        // Log completion span
        await opik.span({
            traceId,
            name: `${operationName}-stream-completion`,
            output: fullResponse.substring(0, 500) + (fullResponse.length > 500 ? '...' : ''),
            metadata: {
                duration_ms: duration,
                total_tokens_estimate: totalTokens,
                response_length: fullResponse.length,
                streaming: true,
                success: true,
            },
        });

        return { fullResponse, traceId, duration, totalTokens };
    } catch (error: any) {
        const duration = Date.now() - startTime;

        // Log error span
        await opik.span({
            traceId,
            name: `${operationName}-stream-error`,
            metadata: {
                error: error.message,
                partial_response_length: fullResponse.length,
                duration_ms: duration,
                success: false,
            },
        });

        throw error;
    }
}

/**
 * Wrapper for JSON mode Gemini calls with Opik tracking
 */
export async function trackedGeminiJSON<T>(
    operationName: string,
    prompt: string,
    systemInstruction: string,
    metadata: TrackingMetadata
): Promise<{ result: T; traceId: string; duration: number }> {
    const traceId = generateTraceId();
    const startTime = Date.now();

    try {
        // Start Opik trace
        await opik.trace({
            id: traceId,
            name: operationName,
            input: {
                prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''),
            },
            metadata: getUserMetadata(metadata.userId, {
                ...metadata,
                mode: 'json',
            }),
        });

        // Call Gemini in JSON mode
        const result = await geminiJSON<T>(prompt, systemInstruction);
        const duration = Date.now() - startTime;

        // Log completion span
        await opik.span({
            traceId,
            name: `${operationName}-json-completion`,
            output: result,
            metadata: {
                duration_ms: duration,
                mode: 'json',
                success: true,
            },
        });

        return { result, traceId, duration };
    } catch (error: any) {
        const duration = Date.now() - startTime;

        // Log error span
        await opik.span({
            traceId,
            name: `${operationName}-json-error`,
            metadata: {
                error: error.message,
                duration_ms: duration,
                success: false,
            },
        });

        throw error;
    }
}
