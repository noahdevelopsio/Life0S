'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from './DashboardCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Need to create this or use simple textarea
import { Mic } from 'lucide-react';

export function QuickEntryWidget({ onEntryCreated }: { onEntryCreated: () => void }) {
    const [content, setContent] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/dashboard/journal/new?initial=${encodeURIComponent(content)}`);
    };

    return (
        <DashboardCard
            className="bg-[#648468] text-white relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Solma AI Journal</h3>
                        <p className="text-white/60 text-sm">Listening your story...</p>
                    </div>
                    <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg text-primary hover:scale-105 transition-transform">
                        <Mic className="w-6 h-6" />
                    </button>
                </div>

                {/* Waveform Visualization (simplified CSS animation) */}
                <div className="flex items-end justify-center gap-[6px] h-12 mb-6">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="w-[3px] bg-white/80 rounded-full animate-pulse"
                            style={{
                                height: `${Math.max(20, Math.random() * 100)}%`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-3xl p-2 pl-4 flex items-center justify-between">
                        <input
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type here or dictate..."
                            className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 w-full"
                        />
                        <Button size="icon" className="rounded-full bg-primary text-white h-9 w-9 shrink-0 ml-2">
                            ➤
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardCard>
    );
}
