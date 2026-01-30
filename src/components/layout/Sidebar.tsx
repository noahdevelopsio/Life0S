'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Book, Flag, Sparkles, BookOpen, Calendar, Settings, LogOut, Sun, Moon, User as UserIcon, MessageCircle } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { useThemeStore } from '@/store/themeStore';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter(); // Add router
    const { user, signOut } = useUser();
    const { theme, setTheme } = useThemeStore();

    const handleSignOut = async () => {
        await signOut();
        router.refresh();
        router.push('/login');
    };

    const navItems = [
        { icon: Home, label: 'Home', href: '/dashboard' },
        { icon: Book, label: 'Journal', href: '/journal' },
        { icon: Flag, label: 'Goals', href: '/goals' },
        { icon: Calendar, label: 'Timeline', href: '/timeline' },
        { icon: MessageCircle, label: 'AI Companion', href: '/ai' },
        { icon: BookOpen, label: 'Reflections', href: '/reflections' },
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 z-50 transition-colors duration-300">
            {/* Profile Section */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
                    {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                        {user?.user_metadata?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        3 Day Streak
                    </span>
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6 mx-2" />

            {/* Main Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                                isActive ? "text-white" : ""
                            )} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-6 mx-2" />

            {/* Footer */}
            <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-left text-sm font-medium">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-left text-sm font-medium"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors text-left text-sm font-medium mt-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
