import { NextRequest, NextResponse } from 'next/server';
import { opik } from '@/lib/opik/client';

export async function GET(req: NextRequest) {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Analyze last week's data
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Log analysis task to Opik
        await opik.log({
            name: 'weekly-ai-quality-analysis',
            properties: {
                period: 'last-7-days',
                timestamp: new Date().toISOString(),
                analysisType: 'automated',
            },
        });

        // 1. Get recent evaluations from Supabase (mirror of Opik data)
        const { getRecentEvaluations } = await import('@/lib/opik/metrics-storage');
        const evaluations = await getRecentEvaluations(7);

        if (!evaluations || evaluations.length === 0) {
            return NextResponse.json({ success: true, message: 'No evaluations to analyze' });
        }

        // 2. Identify patterns and low scores
        const lowScores = evaluations.filter((e: any) => (e.overall_score || 0) < 0.6);
        const avgScore = evaluations.reduce((sum: number, e: any) => sum + (e.overall_score || 0), 0) / evaluations.length;

        // Calculate metric averages
        const metrics = {
            supportiveness: evaluations.reduce((sum: number, e: any) => sum + (e.supportiveness_score || 0), 0) / evaluations.length,
            actionability: evaluations.reduce((sum: number, e: any) => sum + (e.actionability_score || 0), 0) / evaluations.length,
            personalization: evaluations.reduce((sum: number, e: any) => sum + (e.personalization_score || 0), 0) / evaluations.length,
        };

        // 3. Log analysis results to Opik
        await opik.log({
            name: 'weekly-ai-quality-report',
            properties: {
                period: 'last-7-days',
                total_interactions: evaluations.length,
                average_quality: avgScore,
                low_score_count: lowScores.length,
                low_score_rate: lowScores.length / evaluations.length,
                metric_averages: metrics,
                lowest_performing_metric: Object.entries(metrics).sort((a, b) => a[1] - b[1])[0][0],
                timestamp: new Date().toISOString(),
                status: avgScore > 0.7 ? 'healthy' : 'needs_attention',
            },
        });

        return NextResponse.json({ success: true, analyzed: true });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
