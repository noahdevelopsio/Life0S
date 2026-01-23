'use client';

import { DashboardCard } from './DashboardCard';
import { ArrowUpRight } from 'lucide-react';

export function DailySummaryCard({ entries }: { entries: any[] }) {
    return (
        <DashboardCard
            title="Recent Journal"
            headerAction={
                <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </button>
            }
            className="h-full"
        >
            <div className="space-y-6 mt-4">
                {entries.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        No entries today. Start writing!
                    </div>
                ) : (
                    entries.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="text-lg">📄</span>
                                </div>
                                <div>
                                    <p className="text-[15px] font-semibold truncate max-w-[200px]">{entry.content}</p>
                                    <p className="text-[11px] text-slate-400">{new Date(entry.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {entry.mood && (
                                <span className="px-3 py-1.5 rounded-full bg-[#E3EDE4] text-[#5A7C5F] text-[10px] font-bold uppercase">
                                    {entry.mood}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </DashboardCard>
    );
}
