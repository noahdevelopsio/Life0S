'use client';

import Link from 'next/link';
import { Hand, MessageCircle, Bell } from 'lucide-react';
import { subscribeToPush } from '@/lib/web-push';

export function DashboardHeader({ userName }: { userName?: string | null }) {
    // Use current time to greet
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
    if (hour >= 18) greeting = 'Good evening';

    const handleSubscribe = async () => {
        try {
            await subscribeToPush();
            alert('Notifications enabled!');
        } catch (error) {
            console.error(error);
            alert('Failed to enable notifications. Make sure you are on a supported device.');
        }
    };

    return (
        <div className="flex flex-col space-y-4 mb-6 md:space-y-0 md:mb-8">
            {/* Mobile Top Bar */}
            <div className="flex items-center justify-between md:hidden">
                <span className="font-bold text-2xl text-primary tracking-tight">LifeOS</span>
                <div className="flex items-center gap-2">
                    <button onClick={handleSubscribe} className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                        <Bell className="w-6 h-6" />
                    </button>
                    <Link href="/ai" className="p-2 -mr-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                        <MessageCircle className="w-6 h-6" />
                    </Link>
                </div>
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSubscribe}
                        className="hidden md:flex p-3 rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-primary shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                        title="Enable Notifications"
                    >
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-20 h-20 rounded-full orb-gradient opacity-60 hidden md:block"></div>
                </div>
            </div>
        </div>
    );
}
