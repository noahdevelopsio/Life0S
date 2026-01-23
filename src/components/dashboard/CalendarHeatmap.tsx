'use client';

import { DashboardCard } from './DashboardCard';

export function CalendarHeatmap({ userId }: { userId: string }) {
    // Placeholder heatmap
    return (
        <DashboardCard title="Consistency">
            <div className="flex flex-wrap gap-1 mt-4">
                {[...Array(28)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-primary/20' : 'bg-primary'}`}
                    />
                ))}
            </div>
        </DashboardCard>
    );
}
