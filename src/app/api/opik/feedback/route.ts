import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { opik } from '@/lib/opik/client';

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

        const { traceId, feedback, comment } = await req.json();

        if (!traceId || !feedback) {
            return NextResponse.json(
                { error: 'traceId and feedback are required' },
                { status: 400 }
            );
        }

        if (!['up', 'down'].includes(feedback)) {
            return NextResponse.json(
                { error: 'feedback must be "up" or "down"' },
                { status: 400 }
            );
        }

        // Log feedback to Opik
        await opik.feedback({
            traceId,
            score: feedback === 'up' ? 1 : 0,
            metadata: {
                userId: user.id,
                feedbackType: feedback,
                comment: comment || null,
                timestamp: new Date().toISOString(),
            },
        });

        // Optionally store in Supabase for local analytics
        // Check if ai_feedback table exists first (graceful failure)
        try {
            await supabase.from('ai_feedback').insert({
                trace_id: traceId,
                user_id: user.id,
                feedback_type: feedback,
                comment: comment || null,
            });
        } catch (dbError) {
            // Table might not exist - that's okay, Opik has the feedback
            console.log('[Feedback] Supabase storage skipped (table may not exist)');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback error:', error);
        return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
    }
}
