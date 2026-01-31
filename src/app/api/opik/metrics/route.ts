import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSummary } from '@/lib/opik/metrics-storage';

export async function GET(req: NextRequest) {
    try {
        const metrics = await getMetricsSummary();

        if (!metrics) {
            // Return default/empty metrics if tables don't exist yet
            return NextResponse.json({
                qualityScores: {
                    supportiveness: 0,
                    actionability: 0,
                    personalization: 0,
                    overallQuality: 0,
                },
                usage: {
                    totalChats: 0,
                    totalSummarizations: 0,
                    avgResponseTime: 0,
                    estimatedCost: 0,
                },
                feedback: {
                    thumbsUp: 0,
                    thumbsDown: 0,
                    satisfactionRate: 0,
                },
                performance: {
                    avgDuration: 0,
                    avgTokens: 0,
                    slowResponses: 0,
                },
                totalEvaluations: 0,
                totalFeedback: 0,
                isDemo: true, // Flag that this is empty/demo data
            });
        }

        return NextResponse.json(metrics);
    } catch (error) {
        console.error('Metrics API error:', error);
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}
