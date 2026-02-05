import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type EvaluationData = {
    traceId: string;
    userId?: string;
    operation: string;
    scores: {
        supportiveness?: number;
        actionability?: number;
        personalization?: number;
        length?: number;
        overall?: number;
    };
    performance?: {
        duration?: number;
        tokens?: number;
        cost?: number;
    };
};

/**
 * Save evaluation scores to Supabase for the metrics dashboard
 */
export async function saveEvaluation(data: EvaluationData): Promise<boolean> {
    try {
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

        const { error } = await supabase.from('ai_evaluations').insert({
            trace_id: data.traceId,
            user_id: data.userId || null,
            operation: data.operation,
            supportiveness_score: data.scores.supportiveness,
            actionability_score: data.scores.actionability,
            personalization_score: data.scores.personalization,
            length_score: data.scores.length,
            overall_score: data.scores.overall,
            duration_ms: data.performance?.duration,
            token_count: data.performance?.tokens,
            estimated_cost: data.performance?.cost,
        });

        if (error) {
            // Table might not exist yet - graceful failure
            console.log('[Metrics] Supabase save skipped:', error.message);
            return false;
        }

        return true;
    } catch (e) {
        console.error('[Metrics] Failed to save evaluation:', e);
        return false;
    }
}

/**
 * Save user feedback to Supabase
 */
export async function saveFeedback(
    traceId: string,
    userId: string,
    feedbackType: 'up' | 'down',
    comment?: string
): Promise<boolean> {
    try {
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

        const { error } = await supabase.from('ai_feedback').insert({
            trace_id: traceId,
            user_id: userId,
            feedback_type: feedbackType,
            comment: comment || null,
        });

        if (error) {
            console.log('[Metrics] Feedback save skipped:', error.message);
            return false;
        }

        return true;
    } catch (e) {
        console.error('[Metrics] Failed to save feedback:', e);
        return false;
    }
}

/**
 * Get aggregated metrics for the dashboard (last 30 days)
 */
export async function getMetricsSummary() {
    try {
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

        // Get evaluation aggregates
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: evaluations, error: evalError } = await supabase
            .from('ai_evaluations')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const { data: feedback, error: feedbackError } = await supabase
            .from('ai_feedback')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (evalError || feedbackError) {
            console.log('[Metrics] Query error:', evalError?.message || feedbackError?.message);
            return null;
        }

        const evals = evaluations || [];
        const fb = feedback || [];

        // Calculate averages
        const avgScore = (arr: any[], field: string) => {
            const valid = arr.filter(e => e[field] != null);
            if (valid.length === 0) return 0;
            return valid.reduce((sum, e) => sum + Number(e[field]), 0) / valid.length;
        };

        const thumbsUp = fb.filter(f => f.feedback_type === 'up').length;
        const thumbsDown = fb.filter(f => f.feedback_type === 'down').length;
        const totalFeedback = thumbsUp + thumbsDown;

        return {
            qualityScores: {
                supportiveness: avgScore(evals, 'supportiveness_score'),
                actionability: avgScore(evals, 'actionability_score'),
                personalization: avgScore(evals, 'personalization_score'),
                overallQuality: avgScore(evals, 'overall_score'),
            },
            usage: {
                totalChats: evals.filter(e => e.operation === 'ai-chat-conversation').length,
                totalSummarizations: evals.filter(e => e.operation === 'entry-summarization').length,
                avgResponseTime: avgScore(evals, 'duration_ms') / 1000, // Convert to seconds
                estimatedCost: evals.reduce((sum, e) => sum + (Number(e.estimated_cost) || 0), 0),
            },
            feedback: {
                thumbsUp,
                thumbsDown,
                satisfactionRate: totalFeedback > 0 ? thumbsUp / totalFeedback : 0,
            },
            performance: {
                avgDuration: Math.round(avgScore(evals, 'duration_ms')),
                avgTokens: Math.round(avgScore(evals, 'token_count')),
                slowResponses: evals.filter(e => (e.duration_ms || 0) > 5000).length,
            },
            totalEvaluations: evals.length,
            totalFeedback: fb.length,
        };
    } catch (e) {
        console.error('[Metrics] Failed to get summary:', e);
        return null;
    }
}
/**
 * Get recent evaluations for analysis
 */
export async function getRecentEvaluations(days: number = 7) {
    try {
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

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('ai_evaluations')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('[Metrics] Failed to get recent evaluations:', e);
        return [];
    }
}
