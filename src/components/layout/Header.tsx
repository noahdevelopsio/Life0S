'use client';

import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
    userName?: string | null;
    userImage?: string | null;
}

export function Header({ userName, userImage }: HeaderProps) {
    return (
        <header className="px-6 flex items-center justify-between mb-8 pt-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E8D4C4] flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm relative">
                    {userImage ? (
                        <img alt="User profile" className="w-full h-full object-cover" src={userImage} />
                    ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {userName ? userName[0].toUpperCase() : 'U'}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Good morning,</p>
                    <h1 className="text-lg font-bold">{userName || 'Guest'}</h1>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400 hover:text-slate-600 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
