'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Activity,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Zap,
    Target,
    TrendingUp,
    Clock,
    DollarSign,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Metric Card Component
function MetricCard({
    title,
    value,
    target,
    description,
    icon: Icon,
    trend
}: {
    title: string;
    value: number;
    target: number;
    description: string;
    icon?: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
}) {
    const percentage = Math.round(value * 100);
    const isAboveTarget = value >= target;

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {title}
                    </CardTitle>
                    {Icon && <Icon className="h-4 w-4 text-slate-400" />}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className={cn(
                        "text-3xl font-bold",
                        isAboveTarget ? "text-green-600" : "text-amber-600"
                    )}>
                        {percentage}%
                    </span>
                    <span className="text-sm text-slate-500">
                        / {Math.round(target * 100)}% target
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{description}</p>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isAboveTarget ? "bg-green-500" : "bg-amber-500"
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// Stats Card Component
function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'text-primary'
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    iconColor?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl bg-slate-100 dark:bg-slate-800", iconColor)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-sm text-slate-500">{title}</p>
                        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function OpikDemoPage() {
    // Simulated metrics (in production, these would come from Opik API)
    const [metrics] = useState({
        qualityScores: {
            supportiveness: 0.87,
            actionability: 0.73,
            personalization: 0.65,
            overallQuality: 0.78,
        },
        usage: {
            totalChats: 142,
            totalSummarizations: 89,
            avgResponseTime: 1.8,
            estimatedCost: 2.34,
        },
        feedback: {
            thumbsUp: 124,
            thumbsDown: 18,
            satisfactionRate: 0.87,
        },
        performance: {
            avgDuration: 1847,
            avgTokens: 542,
            slowResponses: 3,
        }
    });

    const feedbackTotal = metrics.feedback.thumbsUp + metrics.feedback.thumbsDown;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        LifeOS × Opik Integration
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Comprehensive AI observability and evaluation for better user outcomes
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Activity className="h-4 w-4" />
                    View in Opik Dashboard
                </Button>
            </div>

            {/* Quality Scores Grid */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    AI Response Quality Scores
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Supportiveness"
                        value={metrics.qualityScores.supportiveness}
                        target={0.70}
                        description="Encouraging, non-judgmental tone"
                        icon={ThumbsUp}
                    />
                    <MetricCard
                        title="Actionability"
                        value={metrics.qualityScores.actionability}
                        target={0.60}
                        description="Provides concrete next steps"
                        icon={Zap}
                    />
                    <MetricCard
                        title="Personalization"
                        value={metrics.qualityScores.personalization}
                        target={0.50}
                        description="Uses user-specific context"
                        icon={Target}
                    />
                    <MetricCard
                        title="Overall Quality"
                        value={metrics.qualityScores.overallQuality}
                        target={0.70}
                        description="Weighted average score"
                        icon={TrendingUp}
                    />
                </div>
            </section>

            {/* Usage Stats */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Usage Statistics (Last 30 Days)
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <StatsCard
                        title="AI Conversations"
                        value={metrics.usage.totalChats}
                        icon={MessageSquare}
                        iconColor="text-blue-500"
                    />
                    <StatsCard
                        title="Entry Summarizations"
                        value={metrics.usage.totalSummarizations}
                        icon={Sparkles}
                        iconColor="text-purple-500"
                    />
                    <StatsCard
                        title="Avg Response Time"
                        value={`${metrics.usage.avgResponseTime}s`}
                        icon={Clock}
                        iconColor="text-green-500"
                    />
                    <StatsCard
                        title="Estimated Cost"
                        value={`$${metrics.usage.estimatedCost.toFixed(2)}`}
                        subtitle="Based on Gemini pricing"
                        icon={DollarSign}
                        iconColor="text-amber-500"
                    />
                </div>
            </section>

            {/* User Satisfaction */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-primary" />
                    User Satisfaction
                </h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Thumbs Up */}
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-green-100 dark:bg-green-900/30">
                                    <ThumbsUp className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-600">{metrics.feedback.thumbsUp}</p>
                                    <p className="text-sm text-slate-500">Positive Feedback</p>
                                </div>
                            </div>

                            {/* Thumbs Down */}
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-900/30">
                                    <ThumbsDown className="h-8 w-8 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-red-500">{metrics.feedback.thumbsDown}</p>
                                    <p className="text-sm text-slate-500">Negative Feedback</p>
                                </div>
                            </div>

                            {/* Satisfaction Rate */}
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-primary/10">
                                    <TrendingUp className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-primary">
                                        {Math.round(metrics.feedback.satisfactionRate * 100)}%
                                    </p>
                                    <p className="text-sm text-slate-500">Satisfaction Rate</p>
                                    <p className="text-xs text-slate-400">{feedbackTotal} total responses</p>
                                </div>
                            </div>
                        </div>

                        {/* Satisfaction Progress Bar */}
                        <div className="mt-6">
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-green-500 transition-all duration-500"
                                    style={{ width: `${metrics.feedback.satisfactionRate * 100}%` }}
                                />
                                <div
                                    className="bg-red-400 transition-all duration-500"
                                    style={{ width: `${(1 - metrics.feedback.satisfactionRate) * 100}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Performance Metrics */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Performance Metrics
                </h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-3xl font-bold">{metrics.performance.avgDuration}ms</p>
                                <p className="text-sm text-slate-500 mt-1">Avg Response Time</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-3xl font-bold">{metrics.performance.avgTokens}</p>
                                <p className="text-sm text-slate-500 mt-1">Avg Tokens/Response</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <p className={cn(
                                    "text-3xl font-bold",
                                    metrics.performance.slowResponses > 5 ? "text-red-500" : "text-green-600"
                                )}>
                                    {metrics.performance.slowResponses}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">Slow Responses ({'>'}5s)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Integration Highlights */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Integration Features</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">🔍 Trace Tracking</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Every AI interaction generates a unique trace ID, enabling
                                end-to-end visibility from user input to AI response.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">📊 Custom Evaluators</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                5 custom metrics specifically designed for LifeOS: supportiveness,
                                actionability, personalization, length, and overall quality.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">👍 User Feedback Loop</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Thumbs up/down on every AI message, linked to traces for
                                correlating user satisfaction with response quality.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-2">⚡ Performance Alerts</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Automatic alerts for slow responses ({'>'}5s) and high-cost
                                operations, ensuring optimal user experience.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer Note */}
            <div className="text-center text-sm text-slate-500 pt-4 border-t">
                <p>
                    Powered by <strong>Opik</strong> — AI Observability for the Modern Stack
                </p>
                <p className="text-xs mt-1">
                    Data shown is simulated. Connect to Opik dashboard for live metrics.
                </p>
            </div>
        </div>
    );
}
