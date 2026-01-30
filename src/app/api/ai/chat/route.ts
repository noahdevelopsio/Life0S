import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { streamGemini } from '@/lib/ai/gemini';
import { opik } from '@/lib/opik/client';
import { COMPANION_SYSTEM_INSTRUCTION, CHAT_CONTEXT_BUILDER } from '@/lib/ai/prompts';

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

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, conversationId } = await req.json();

        // Get user context for personalization
        const userData = await getUserContext(supabase, user.id);
        const systemInstruction = COMPANION_SYSTEM_INSTRUCTION + '\n\n' + CHAT_CONTEXT_BUILDER(userData);

        // Stream response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                await streamGemini(
                    messages,
                    systemInstruction,
                    (chunk) => {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                    }
                );
                controller.close();
            },
        });

        // Log to Opik (non-blocking)
        opik.trace({
            name: 'ai-chat',
            input: { messages, conversationId },
            metadata: { userId: user.id },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function getUserContext(supabase: any, userId: string) {
    // Fetch recent entries, active goals
    // Wrap in try/catch to avoid breaking chat if DB query fails
    try {
        const [entries, goals] = await Promise.all([
            supabase
                .from('entries')
                .select('entry_date, content')
                .eq('user_id', userId)
                .order('entry_date', { ascending: false })
                .limit(5),
            supabase
                .from('goals')
                .select('title, frequency, current_value, target_value, streak')
                .eq('user_id', userId)
                .eq('status', 'active'),
        ]);

        return {
            recentEntries: entries.data || [],
            activeGoals: goals.data || [],
            weeklyStats: {
                totalEntries: entries.data?.length || 0,
                goalsHit: 0,
                totalGoals: goals.data?.length || 0,
                topCategories: [],
            },
        };
    } catch (e) {
        console.error("Context fetch failed", e);
        return { recentEntries: [], activeGoals: [], weeklyStats: { totalEntries: 0, goalsHit: 0, totalGoals: 0, topCategories: [] } };
    }
}
