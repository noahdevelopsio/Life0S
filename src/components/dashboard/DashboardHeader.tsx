'use client';

import Link from 'next/link';
import { Hand, MessageCircle } from 'lucide-react';

export function DashboardHeader({ userName }: { userName?: string | null }) {
    // Use current time to greet
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
    if (hour >= 18) greeting = 'Good evening';

    return (
        <div className="flex flex-col space-y-4 mb-6 md:space-y-0 md:mb-8">
            {/* Mobile Top Bar */}
            <div className="flex items-center justify-between md:hidden">
                <span className="font-bold text-2xl text-primary tracking-tight">LifeOS</span>
                <Link href="/ai" className="p-2 -mr-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <MessageCircle className="w-6 h-6" />
                </Link>
            </div>

            {/* Greeting Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {greeting},
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        {userName?.split(' ')[0] || 'Friend'} <span className="inline-block hover:animate-wave origin-[70%_70%] text-2xl">👋</span>
                    </h2>
                    <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 pt-1">
                        Ready to focus today?
                    </p>
                </div>
                <div className="w-20 h-20 rounded-full orb-gradient opacity-60 hidden md:block"></div>
            </div>
        </div>
    );
}
