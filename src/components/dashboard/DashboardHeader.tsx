'use client';

export function DashboardHeader({ userName }: { userName?: string | null }) {
    // Use current time to greet
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
    if (hour >= 18) greeting = 'Good evening';

    return (
        <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
                <h2 className="text-4xl font-light leading-tight">{greeting}, {userName?.split(' ')[0] || 'Friend'} 👋</h2>
                <p className="text-2xl text-slate-300 dark:text-slate-500 font-light">Ready to focus today?</p>
            </div>
            <div className="w-20 h-20 rounded-full orb-gradient opacity-60 hidden md:block"></div>
        </div>
    );
}
