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
            model: 'gemini-1.5-flash',
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

        // Log to Opik (optional/background)
        trackFeatureUsage('ai_chat', 'system', { model: 'gemini-1.5-flash' }).catch(() => { });

        return {
            role: 'model',
            content: text,
        };
    } catch (error) {
        console.error('Error calling Gemini:', error);
        throw new Error('Failed to generate response from Gemini');
    }
}
