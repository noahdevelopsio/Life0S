import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { trackedGeminiStream } from '@/lib/opik/gemini-tracker';
import { evaluateOverallQuality } from '@/lib/opik/evaluators';
import { trackPerformanceMetrics } from '@/lib/opik/performance';
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

        // Create conversation if needed
        let activeConversationId = conversationId;
        if (!activeConversationId) {
            const { data: conv, error: convError } = await supabase
                .from('conversations')
                .insert({
                    user_id: user.id,
                    title: messages[messages.length - 1].content.slice(0, 40) + '...'
                })
                .select('id')
                .single();

            if (convError || !conv) {
                console.error('Failed to create conversation', convError);
                throw new Error('Failed to create conversation');
            }
            activeConversationId = conv.id;
        }

        // Save User Message
        const lastUserMsg = messages[messages.length - 1];
        const { error: msgError } = await supabase.from('messages').insert({
            conversation_id: activeConversationId,
            role: 'user',
            content: lastUserMsg.content
        });

        if (msgError) console.error('Failed to save user message', msgError);

        // Get user context for personalization
        const userData = await getUserContext(supabase, user.id);
        const systemInstruction = COMPANION_SYSTEM_INSTRUCTION + '\n\n' + CHAT_CONTEXT_BUILDER(userData);

        // Stream response with Opik tracking
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                // Send conversation ID first so client can update URL
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: activeConversationId })}\n\n`));

                let traceId = '';
                let fullResponse = '';
                let duration = 0;
                let totalTokens = 0;

                try {
                    // Use tracked Gemini stream with Opik integration
                    const result = await trackedGeminiStream(
                        'ai-chat-conversation',
                        messages,
                        systemInstruction,
                        (chunk) => {
                            fullResponse += chunk;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                        },
                        {
                            userId: user.id,
                            feature: 'ai-chat',
                            conversationId: activeConversationId,
                            messageCount: messages.length,
                        }
                    );

                    traceId = result.traceId;
                    duration = result.duration;
                    totalTokens = result.totalTokens;

                    // Save AI Message
                    if (fullResponse) {
                        await supabase.from('messages').insert({
                            conversation_id: activeConversationId,
                            role: 'assistant',
                            content: fullResponse
                        });
                    }

                    // Run evaluations (non-blocking)
                    evaluateOverallQuality(traceId, fullResponse, {
                        userName: userData.userName,
                        activeGoals: userData.activeGoals,
                        currentStreak: userData.currentStreak,
                        preferredCategories: [],
                    }).catch(err => console.error('[Opik] Evaluation error:', err));

                    // Track performance metrics (non-blocking)
                    trackPerformanceMetrics(traceId, 'ai-chat', {
                        duration,
                        totalTokens,
                        model: 'gemini-2.5-flash-lite',
                    }).catch(err => console.error('[Opik] Performance tracking error:', err));

                    // Send completion with traceId for feedback collection
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        traceId,
                        metadata: {
                            duration,
                            tokens: totalTokens,
                        }
                    })}\n\n`));

                } catch (error) {
                    console.error('Stream error:', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        error: 'Failed to generate response'
                    })}\n\n`));
                }

                controller.close();
            },
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
    try {
        const [entries, goals, profile] = await Promise.all([
            supabase
                .from('entries')
                .select('entry_date, content, mood')
                .eq('user_id', userId)
                .order('entry_date', { ascending: false })
                .limit(5),
            supabase
                .from('goals')
                .select('title, frequency, current_value, target_value, streak')
                .eq('user_id', userId)
                .eq('status', 'active'),
            supabase
                .from('profiles')
                .select('full_name, preferred_categories')
                .eq('id', userId)
                .single(),
        ]);

        // Calculate current streak from goals
        const maxStreak = goals.data?.reduce((max: number, g: any) =>
            Math.max(max, g.streak || 0), 0) || 0;

        return {
            userName: profile.data?.full_name || 'there',
            recentEntries: entries.data || [],
            activeGoals: goals.data || [],
            currentStreak: maxStreak,
            weeklyStats: {
                totalEntries: entries.data?.length || 0,
                goalsHit: 0,
                totalGoals: goals.data?.length || 0,
                topCategories: profile.data?.preferred_categories || [],
            },
        };
    } catch (e) {
        console.error("Context fetch failed", e);
        return {
            userName: 'there',
            recentEntries: [],
            activeGoals: [],
            currentStreak: 0,
            weeklyStats: { totalEntries: 0, goalsHit: 0, totalGoals: 0, topCategories: [] }
        };
    }
}

