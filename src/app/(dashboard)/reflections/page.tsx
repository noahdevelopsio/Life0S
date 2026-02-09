'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { getWeeklyReflectionPrompt } from '@/lib/ai/prompts'
import { chatWithGemini } from '@/lib/ai/gemini'
import { Sparkles } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { generateWeeklyReflectionAction } from '@/actions/reflections'
import ReactMarkdown from 'react-markdown'

type Reflection = {
  id: string
  period_type: 'week' | 'month'
  start_date: string
  end_date: string
  summary: string
  insights: any
  metrics: any
  created_at: string
}

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [currentReflection, setCurrentReflection] = useState<Reflection | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  const { user } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // 1. Try store
      if (user) {
        await loadReflections(user.id);
        return;
      }

      // 2. Try Supabase directly (handles refresh)
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await loadReflections(supabaseUser.id);
      } else {
        console.log('No user found, stopping spinner');
        setLoading(false);
      }
    }
    init();
  }, [user])

  const loadReflections = async (userId: string) => {
    if (!userId) return; // Prevent 400 error
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error;

      const formatted = (data || []).map(reflection => ({
        ...reflection,
        period_type: reflection.period_type as 'week' | 'month'
      })) as Reflection[]

      setReflections(formatted)

      // Auto-select latest
      if (formatted.length > 0) {
        setCurrentReflection(formatted[0])
      }

      // Check if we need to generate a new one
      const latest = formatted[0];
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const needsNewReflection = !latest || new Date(latest.created_at) < sixDaysAgo;

      if (needsNewReflection && !isGenerating) {
        // Trigger generic in background, but show state
        console.log('Auto-generating weekly reflection...');
        generateWeeklyReflection();
      }

    } catch (e) {
      console.error('Failed to load reflections:', e);
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyReflection = async () => {
    setIsGenerating(true)
    try {
      const result = await generateWeeklyReflectionAction();
      if (!result.success) {
        console.error(result.message);
        // Silent fail or toast? for now silent to avoid loop alerts
        return;
      }

      // Refresh list
      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        // Just fetch data, don't re-trigger check to avoid loops
        const { data } = await supabase
          .from('reflections')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data) {
          const formatted = data.map(reflection => ({
            ...reflection,
            period_type: reflection.period_type as 'week' | 'month'
          })) as Reflection[];
          setReflections(formatted);
          if (formatted.length > 0) setCurrentReflection(formatted[0]);
        }
      }
    } catch (error) {
      console.error('Error generating reflection:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const calculateMoodTrends = (entries: any[]) => {
    const moodOrder = ['terrible', 'bad', 'okay', 'good', 'great']
    return entries
      .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
      .slice(-7) // Last 7 entries
      .map(entry => entry.mood || 'okay')
  }

  const calculateTopTags = (entries: any[]) => {
    const tagCount: Record<string, number> = {}

    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)
  }

  const calculateAverageMood = (entries: any[]) => {
    if (entries.length === 0) return 'N/A'

    const moodScores = { terrible: 1, bad: 2, okay: 3, good: 4, great: 5 }
    const totalScore = entries.reduce((sum, entry) => {
      return sum + (moodScores[entry.mood as keyof typeof moodScores] || 3)
    }, 0)

    const avgScore = totalScore / entries.length
    const moodLabels = ['terrible', 'bad', 'okay', 'good', 'great']
    return moodLabels[Math.round(avgScore) - 1] || 'okay'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading reflections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-light to-slate-50 dark:from-background-dark dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Weekly Reflections
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              Gain insights into your habits, celebrate wins, and plan for the week ahead with AI-powered analysis.
            </p>
          </div>
          {isGenerating && (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 text-primary rounded-full animate-pulse">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary"></div>
              <span className="font-medium text-sm">Analyzing your week...</span>
            </div>
          )}
        </div>

        {/* content */}
        <div className="space-y-12">
          {/* Current Reflection Card */}
          {currentReflection && (
            <section id="main-reflection" className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl scroll-mt-24">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/80 via-primary to-primary/80"></div>
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Latest Insights
                      </h2>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {new Date(currentReflection.created_at).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                    Active Week
                  </span>
                </div>

                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-10">
                  <ReactMarkdown>{currentReflection.summary}</ReactMarkdown>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Journal Entries', value: currentReflection.metrics?.entriesCount || 0, sub: 'Total this week' },
                    { label: 'Active Goals', value: currentReflection.metrics?.goalsActive || 0, sub: 'Currently tracking' },
                    { label: 'Average Mood', value: currentReflection.metrics?.avgMood || 'N/A', sub: 'Overall sentiment' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {stat.value}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-200">
                        {stat.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {stat.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Past Reflections List */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
              Reflection History
            </h3>

            {reflections.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Your Journey Starts Here
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Your first weekly reflection is being generated right now! Check back in a few seconds.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    onClick={() => {
                      setCurrentReflection(reflection);
                      document.getElementById('main-reflection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`group cursor-pointer rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border ${currentReflection?.id === reflection.id
                        ? 'bg-slate-50 dark:bg-slate-800 border-primary ring-1 ring-primary'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {reflection.period_type === 'week' ? 'Weekly' : 'Monthly'}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(reflection.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-sm line-clamp-4 leading-relaxed mb-4 pointer-events-none prose-sm dark:prose-invert">
                      <ReactMarkdown>{reflection.summary}</ReactMarkdown>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 pointer-events-none">
                      <span>{reflection.metrics?.entriesCount || 0} entries</span>
                      <span className="text-primary font-medium group-hover:underline">Read Full</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
