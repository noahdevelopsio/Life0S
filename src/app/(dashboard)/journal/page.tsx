'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export default function JournalPage() {
    const { user } = useUser();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) return;
        loadEntries();
    }, [user]);

    async function loadEntries() {
        const { data } = await supabase
            .from('entries')
            .select('*')
            .eq('user_id', user!.id)
            .order('entry_date', { ascending: false });

        setEntries(data || []);
        setLoading(false);
    }

    const filteredEntries = entries.filter(e =>
        e.content.toLowerCase().includes(search.toLowerCase()) ||
        e.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Journal</h1>
                <Link href="/dashboard/journal/new">
                    <Button className="rounded-full">
                        <Plus className="w-5 h-5 mr-2" /> New Entry
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                    className="pl-10"
                    placeholder="Search entries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No entries found.
                    </div>
                ) : (
                    filteredEntries.map((entry) => (
                        <div key={entry.id} className="bg-white dark:bg-slate-800/50 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl text-slate-500 dark:text-slate-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-500">{new Date(entry.entry_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                {entry.mood && (
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                                        {entry.mood}
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {entry.content}
                            </p>

                            {(entry.tags?.length > 0 || entry.ai_summary) && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    {entry.ai_summary && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 italic flex items-start gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <span>AI Summary: {entry.ai_summary}</span>
                                        </div>
                                    )}
                                    {entry.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {entry.tags.map((tag: string) => (
                                                <span key={tag} className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
