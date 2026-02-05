'use client';

import { useUser } from '@/lib/hooks/useUser';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LogOut, User as UserIcon, Mail, Moon, Sun, ChevronRight, Zap, Book, Brain, Calendar } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/themeStore';

export default function ProfilePage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const { theme, setTheme } = useThemeStore();
    const [stats, setStats] = useState({
        streak: 0,
        weeklyEntries: 0,
        goalsHit: 0,
        consistency: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchStats() {
            setLoadingStats(true);
            try {
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

                // 1. Fetch entries for streak & weekly stats
                const { data: entries } = await supabase
                    .from('entries')
                    .select('entry_date')
                    .eq('user_id', user!.id)
                    .order('entry_date', { ascending: false });

                // 2. Fetch completed goals
                const { data: allGoals } = await supabase
                    .from('goals')
                    .select('current_value, target_value')
                    .eq('user_id', user!.id);

                const actualGoalsHit = allGoals?.filter(g => (g.current_value || 0) >= (g.target_value || 1)).length || 0;

                // Calculate Weekly Entries
                const weeklyEntriesCount = entries?.filter(e => e.entry_date >= sevenDaysAgoStr).length || 0;

                // Calculate Streak
                let currentStreak = 0;
                if (entries && entries.length > 0) {
                    // Normalize dates to YYYY-MM-DD to handle timestamps correctly
                    const uniqueDates = Array.from(new Set(entries.map(e => e.entry_date.split('T')[0]))).sort().reverse();

                    // Check if the most recent entry is today or yesterday
                    const todayStr = new Date().toISOString().split('T')[0];
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
                        currentStreak = 1;
                        let checkDate = new Date(uniqueDates[0]);

                        for (let i = 1; i < uniqueDates.length; i++) {
                            checkDate.setDate(checkDate.getDate() - 1);
                            const expectedDate = checkDate.toISOString().split('T')[0];
                            if (uniqueDates[i] === expectedDate) {
                                currentStreak++;
                            } else {
                                break;
                            }
                        }
                    }
                }

                // Calculate Consistency (Simple metric: entries this week / 7 days * 100, capped at 100)
                const consistencyScore = Math.min(Math.round((weeklyEntriesCount / 7) * 100), 100);

                setStats({
                    streak: currentStreak,
                    weeklyEntries: weeklyEntriesCount,
                    goalsHit: actualGoalsHit,
                    consistency: consistencyScore
                });

            } catch (error) {
                console.error('Error fetching profile stats:', error);
            } finally {
                setLoadingStats(false);
            }
        }

        fetchStats();
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setTheme(newTheme);
    };

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Spinner />
            </div>
        );
    }

    if (!user) return null;

    const initials = user.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.slice(0, 2).toUpperCase();

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 pb-24">

            {/* Header / Identity */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-[#5A7C5F] rounded-full flex items-center justify-center text-white text-2xl font-display font-bold shadow-lg">
                    {initials}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {user.user_metadata?.full_name || 'LifeOS User'}
                    </h1>
                    <p className="text-slate-500 text-sm">{user.email}</p>
                </div>
            </div>

            {/* Streak Hero Card */}
            <DashboardCard className="bg-gradient-to-br from-[#5A7C5F] to-[#4B6A50] text-white border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <div className="text-white/80 text-sm font-medium mb-1">Current Streak</div>
                        <div className="text-5xl font-bold flex items-baseline gap-2">
                            {stats.streak} <span className="text-lg font-normal text-white/60">days</span>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                    </div>
                </div>
            </DashboardCard>

            {/* Weekly Stats */}
            <DashboardCard title="This Week">
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100 dark:divide-slate-800">
                    <div className="p-2">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.weeklyEntries}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Entries</div>
                    </div>
                    <div className="p-2">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.goalsHit}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Goals Hit</div>
                    </div>
                    <div className="p-2">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.consistency}%</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Consistency</div>
                    </div>
                </div>
            </DashboardCard>

            {/* Quick Access */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Quick Access</h3>
                <div className="grid grid-cols-1 gap-3">
                    <QuickLink
                        href="/timeline"
                        icon={Calendar}
                        label="Timeline"
                        color="text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    />
                    <QuickLink
                        href="/ai"
                        icon={Brain}
                        label="AI Companion"
                        color="text-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    />
                    <QuickLink
                        href="/reflections"
                        icon={Book}
                        label="Reflections"
                        color="text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    />
                </div>
            </div>

            {/* Account Details (Restored) */}
            <DashboardCard title="Account">
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Member Since</span>
                        <span className="font-medium">
                            {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Plan</span>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Free Beta
                        </span>
                    </div>
                </div>
            </DashboardCard>

            {/* Settings */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Settings</h3>
                <DashboardCard className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Theme Toggle */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </div>
                            <span className="font-medium">Dark Mode</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "w-12 h-6 rounded-full transition-colors relative",
                                isDarkMode ? "bg-[#5A7C5F]" : "bg-slate-300"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                                isDarkMode ? "left-[calc(100%-22px)]" : "left-0.5"
                            )} />
                        </button>
                    </div>

                    {/* Sign Out */}
                    <div
                        onClick={handleSignOut}
                        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-600"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                            <LogOut className="w-5 h-5 ml-0.5" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                    </div>
                </DashboardCard>
            </div>

            <div className="text-center text-xs text-slate-300 dark:text-slate-600 pt-4">
                LifeOS v1.0.0
            </div>
        </div>
    );
}

function QuickLink({ href, icon: Icon, label, color }: { href: string, icon: any, label: string, color: string }) {
    return (
        <Link href={href}>
            <DashboardCard className="p-4 flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </DashboardCard>
        </Link>
    );
}
