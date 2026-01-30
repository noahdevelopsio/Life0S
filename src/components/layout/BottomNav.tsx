'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Book, Flag, User, Plus, Calendar, Sparkles, Mic, PenLine, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

    if (pathname === '/ai') return null;

    const navItems = [
        { label: 'Home', href: '/dashboard', icon: Home },
        { label: 'Journal', href: '/journal', icon: Book },
        { label: 'Timeline', href: '/timeline', icon: Calendar },
        { label: 'Goals', href: '/goals', icon: Flag },
        { label: 'Profile', href: '/profile', icon: User },
    ];

    const quickActions = [
        { label: 'Chat with AI', icon: MessageCircle, action: () => router.push('/ai'), color: 'bg-indigo-500' },
        { label: 'Voice Note', icon: Mic, action: () => router.push('/journal/new?mode=voice'), color: 'bg-rose-500' },
        { label: 'New Entry', icon: PenLine, action: () => router.push('/journal/new'), color: 'bg-emerald-500' },
        { label: 'Log Goal', icon: Flag, action: () => router.push('/goals'), color: 'bg-amber-500' },
    ];

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Quick Actions Menu */}
            {pathname === '/dashboard' && (
                <div className="fixed bottom-32 right-5 z-50 md:hidden flex flex-col items-end gap-4 pointer-events-none">
                    <AnimatePresence>
                        {isMenuOpen && (
                            <div className="flex flex-col gap-3 pointer-events-auto pb-4">
                                {quickActions.map((action, index) => (
                                    <motion.button
                                        key={action.label}
                                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => {
                                            action.action();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center justify-end gap-3 group"
                                    >
                                        <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700">
                                            {action.label}
                                        </span>
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-black/10", action.color)}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                    <div className="pointer-events-auto">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative overflow-hidden",
                                isMenuOpen ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90" : "bg-primary text-white hover:scale-105"
                            )}
                        >
                            <Plus className={cn("w-7 h-7 absolute transition-all duration-300", isMenuOpen ? "opacity-0 rotate-90" : "opacity-100")} />
                            <X className={cn("w-7 h-7 absolute transition-all duration-300", isMenuOpen ? "opacity-100" : "opacity-0 -rotate-90")} />
                        </button>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-6 left-5 right-5 z-40 md:hidden">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-[32px] px-2 py-2 flex justify-between items-center shadow-2xl shadow-black/5 relative flex-nowrap overflow-hidden">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "transition-all duration-200 flex items-center justify-center rounded-[24px] shrink-0",
                                    active
                                        ? "bg-[#5A7C5F] text-white px-4 py-3 gap-2"
                                        : "p-3 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                                )}
                            >
                                <item.icon className={cn("transition-all", active ? "w-5 h-5" : "w-6 h-6")} />
                                {active && <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
