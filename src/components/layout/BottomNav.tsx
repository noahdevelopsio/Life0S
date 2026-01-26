'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Book, Flag, User, Plus, Calendar } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

    return (
        <>
            {/* Floating Action Button (FAB) */}
            <div className="fixed bottom-32 right-5 z-50 md:hidden">
                <Link href="/journal/new">
                    <button className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                        <Plus className="w-7 h-7" />
                    </button>
                </Link>
            </div>

            <nav className="fixed bottom-6 left-5 right-5 z-50 md:hidden">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-[32px] px-2 py-2 flex justify-between items-center shadow-2xl shadow-black/5 relative">

                    {/* Left Group */}
                    <Link href="/dashboard" className={cn("transition-all duration-200 flex items-center justify-center rounded-[24px]", isActive('/dashboard') ? "bg-[#5A7C5F] text-white px-5 py-3 gap-2" : "p-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400")}>
                        <Home className={cn("transition-all", isActive('/dashboard') ? "w-5 h-5" : "w-6 h-6")} />
                        {isActive('/dashboard') && <span className="text-sm font-bold">Home</span>}
                    </Link>

                    <Link href="/journal" className={cn("transition-all duration-200 flex items-center justify-center rounded-[24px]", isActive('/journal') ? "bg-[#5A7C5F] text-white px-5 py-3 gap-2" : "p-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400")}>
                        <Book className={cn("transition-all", isActive('/journal') ? "w-5 h-5" : "w-6 h-6")} />
                        {isActive('/journal') && <span className="text-sm font-bold">Journal</span>}
                    </Link>

                    <Link href="/timeline" className={cn("transition-all duration-200 flex items-center justify-center rounded-[24px]", isActive('/timeline') ? "bg-[#5A7C5F] text-white px-5 py-3 gap-2" : "p-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400")}>
                        <Calendar className={cn("transition-all", isActive('/timeline') ? "w-5 h-5" : "w-6 h-6")} />
                        {isActive('/timeline') && <span className="text-sm font-bold">Timeline</span>}
                    </Link>





                    {/* Right Group */}
                    <Link href="/goals" className={cn("transition-all duration-200 flex items-center justify-center rounded-[24px]", isActive('/goals') ? "bg-[#5A7C5F] text-white px-5 py-3 gap-2" : "p-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400")}>
                        <Flag className={cn("transition-all", isActive('/goals') ? "w-5 h-5" : "w-6 h-6")} />
                        {isActive('/goals') && <span className="text-sm font-bold">Goals</span>}
                    </Link>

                    <Link href="/profile" className={cn("transition-all duration-200 flex items-center justify-center rounded-[24px]", isActive('/profile') ? "bg-[#5A7C5F] text-white px-5 py-3 gap-2" : "p-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400")}>
                        <User className={cn("transition-all", isActive('/profile') ? "w-5 h-5" : "w-6 h-6")} />
                        {isActive('/profile') && <span className="text-sm font-bold">Profile</span>}
                    </Link>
                </div>
            </nav>
        </>
    );
}
