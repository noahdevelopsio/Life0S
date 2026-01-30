import { GoogleGenerativeAI } from '@google/generative-ai';
import { trackFeatureUsage } from '@/lib/opik/client';

if (!process.env.GEMINI_API_KEY) {
    console.warn('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type GeminiMessage = {
    role: 'user' | 'model';
    content: string;
};

export async function chatWithGemini(
    messages: GeminiMessage[],
    systemInstruction?: string
) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            systemInstruction: systemInstruction
        });

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return {
            role: 'model',
            content: text,
        };
    } catch (error) {
        console.error('Error calling Gemini:', error);
        throw new Error('Failed to generate response from Gemini');
    }
}

export async function geminiJSON<T>(
    prompt: string,
    systemInstruction: string
): Promise<T> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            systemInstruction: systemInstruction,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            return JSON.parse(text) as T;
        } catch (e) {
            console.error("Failed to parse JSON response", text);
            throw new Error("Invalid JSON response from AI");
        }
    } catch (error) {
        console.error('Error calling Gemini JSON:', error);
        throw new Error('Failed to generate JSON response from Gemini');
    }
}

export async function streamGemini(
    messages: any[], // Accepting any[] to match usage in route where it might differ slightly
    systemInstruction: string,
    onChunk: (chunk: string) => void
) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            systemInstruction: systemInstruction
        });

        // Convert typical message format {role, content} to Gemini history
        // Gemini requires the first message in history to be from 'user'
        let history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content || '' }],
        }));

        // Remove leading model messages if any
        while (history.length > 0 && history[0].role === 'model') {
            history.shift();
        }

        const lastMsg = messages[messages.length - 1];
        const lastMsgContent = lastMsg.content || '';

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessageStream(lastMsgContent);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                onChunk(chunkText);
            }
        }

    } catch (error) {
        console.error('Error streaming Gemini:', error);
        throw error;
    }
}
