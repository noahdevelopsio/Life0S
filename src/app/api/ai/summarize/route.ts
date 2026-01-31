import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { trackedGeminiJSON } from '@/lib/opik/gemini-tracker';
import { trackPerformanceMetrics } from '@/lib/opik/performance';
import { SUMMARIZE_ENTRY_INSTRUCTION } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) { }
                },
            }
        );
        const { data: { user } } = await supabase.auth.getUser();

        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content required' }, { status: 400 });
        }

        if (content.length < 10) {
            return NextResponse.json({ error: 'Content too short' }, { status: 400 });
        }

        const prompt = `Analyze this journal entry:\n\n"${content}"`;

        // Use tracked Gemini JSON mode with Opik integration
        const { result, traceId, duration } = await trackedGeminiJSON<{
            summary: string;
            tags: string[];
            mood: string;
        }>(
            'entry-summarization',
            prompt,
            SUMMARIZE_ENTRY_INSTRUCTION,
            {
                userId: user?.id || 'anonymous',
                feature: 'entry-summarization',
                entryLength: content.length,
            }
        );

        // Track performance (non-blocking)
        trackPerformanceMetrics(traceId, 'entry-summarization', {
            duration,
            totalTokens: Math.round((prompt.length + JSON.stringify(result).length) / 4),
            model: 'gemini-2.5-flash-lite',
        }).catch(err => console.error('[Opik] Performance tracking error:', err));

        return NextResponse.json({ ...result, traceId });
    } catch (error) {
        console.error('Summarization error:', error);
        return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
    }
}

