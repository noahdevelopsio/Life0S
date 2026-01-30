'use client';

import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, CheckCircle2, Circle, Flame } from 'lucide-react';
import Link from 'next/link';

interface GoalCardProps {
    goal: any;
    onLogProgress: (goalId: string) => void;
}

export function GoalCard({ goal, onLogProgress }: GoalCardProps) {
    const percentComplete = Math.min(((goal.current_value || 0) / (goal.target_value || 1)) * 100, 100);

    return (
        <DashboardCard className="relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    {goal.categories && (
                        <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md mb-2 inline-flex items-center gap-1">
                            {goal.categories.icon && <span>{goal.categories.icon}</span>}
                            {goal.categories.name}
                        </span>
                    )}
                    <h3 className="text-xl font-bold">{goal.title}</h3>
                    <p className="text-sm text-slate-500">{goal.frequency} goal</p>
                </div>
                <button
                    onClick={() => onLogProgress(goal.id)}
                    className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                    title="Log progress"
                >
                    <Plus className="w-5 h-5 text-primary" />
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="font-semibold">{goal.current_value} / {goal.target_value}</span>
                    <span className="text-slate-500">{Math.round(percentComplete)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${percentComplete}%` }}
                    />
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <span className="font-semibold text-orange-500 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> {goal.streak} day streak
                </span>
            </div>
        </DashboardCard>
    );
}
