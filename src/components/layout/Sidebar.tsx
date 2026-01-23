'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, BarChart2, Book, Flag, User, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: BarChart2, label: 'Stats', href: '/dashboard/stats' },
        { icon: Book, label: 'Journal', href: '/dashboard/journal' },
        { icon: Flag, label: 'Goals', href: '/dashboard/goals' },
        { icon: User, label: 'Profile', href: '/dashboard/profile' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold tracking-tight">LifeOS</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors text-left">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
