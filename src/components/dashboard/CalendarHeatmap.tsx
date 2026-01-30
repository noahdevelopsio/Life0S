import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DashboardCard } from './DashboardCard';
import { Spinner } from '@/components/ui/spinner';

export function CalendarHeatmap({ userId }: { userId: string }) {
    const [heatmapData, setHeatmapData] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        async function loadHeatmap() {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 27); // Last 28 days

            const { data } = await supabase
                .from('entries')
                .select('entry_date')
                .eq('user_id', userId)
                .gte('entry_date', startDate.toISOString().split('T')[0]);

            // Create a map of date -> count
            const dateCounts = (data || []).reduce((acc: any, entry: any) => {
                const date = entry.entry_date.split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            // Generate array for last 28 days
            const counts = [];
            for (let i = 27; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                counts.push(dateCounts[dateString] || 0);
            }

            setHeatmapData(counts);
            setLoading(false);
        }

        loadHeatmap();
    }, [userId]);

    return (
        <DashboardCard title="Consistency">
            {loading ? (
                <div className="flex justify-center py-4">
                    <Spinner />
                </div>
            ) : (
                <div className="flex flex-wrap gap-1 mt-4">
                    {heatmapData.map((count, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-sm transition-colors ${count === 0
                                    ? 'bg-slate-100 dark:bg-slate-800'
                                    : count === 1
                                        ? 'bg-primary/40' // Low activity
                                        : count === 2
                                            ? 'bg-primary/70' // Medium
                                            : 'bg-primary'    // High
                                }`}
                            title={`${count} entries`}
                        />
                    ))}
                </div>
            )}
        </DashboardCard>
    );
}
