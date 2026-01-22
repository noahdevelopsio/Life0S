import { NextRequest, NextResponse } from 'next/server';
import { geminiJSON } from '@/lib/ai/gemini';
import { SUMMARIZE_ENTRY_INSTRUCTION } from '@/lib/ai/prompts';
import { opik } from '@/lib/opik/client';

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content required' }, { status: 400 });
        }

        const prompt = `Analyze this journal entry:\n\n"${content}"`;

        // Use Gemini JSON mode
        const result = await geminiJSON<{
            summary: string;
            tags: string[];
            mood: string;
        }>(prompt, SUMMARIZE_ENTRY_INSTRUCTION);

        // Log to Opik (fire and forget)
        opik.trace({
            name: 'entry-summarization',
            input: { content },
            output: result,
            metadata: { model: 'gemini-1.5-pro' },
        }).catch((err: any) => console.error("Opik trace error", err));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Summarization error:', error);
        return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
    }
}
