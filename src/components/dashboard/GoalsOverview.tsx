'use client';

import { DashboardCard } from './DashboardCard';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function GoalsOverview({ goals }: { goals: any[] }) {
    return (
        <DashboardCard title="Goals Overview" className="h-full">
            <div className="space-y-4 mt-4">
                {goals.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-slate-400 text-sm mb-4">No active goals yet.</p>
                        <Link href="/dashboard/goals" className="text-primary font-semibold text-sm">
                            + Create a Goal
                        </Link>
                    </div>
                ) : (
                    goals.map((goal) => (
                        <div key={goal.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm">{goal.title}</span>
                                <span className="text-xs text-slate-400">{goal.streak} day streak 🔥</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${Math.min(((goal.current_value || 0) / (goal.target_value || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardCard>
    );
}
