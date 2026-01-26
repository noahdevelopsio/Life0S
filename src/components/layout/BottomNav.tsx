'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, BarChart2, Book, Flag, User } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: BarChart2, label: 'Stats', href: '/dashboard/stats' },
        { icon: Book, label: 'Journal', href: '/journal' },
        { icon: Flag, label: 'Goals', href: '/goals' },
        { icon: User, label: 'Profile', href: '/dashboard/profile' },
    ];

    return (
        <nav className="fixed bottom-6 left-5 right-5 z-50 md:hidden">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-[32px] px-2 py-2 flex justify-between items-center shadow-2xl shadow-black/5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "p-4 transition-all duration-200 flex items-center justify-center rounded-[24px]",
                                isActive
                                    ? "bg-[#5A7C5F] text-white px-6 py-3 gap-2"
                                    : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "w-5 h-5")} />
                            {isActive && <span className="text-sm font-bold">{item.label}</span>}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
