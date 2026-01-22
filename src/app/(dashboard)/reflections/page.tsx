'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { getWeeklyReflectionPrompt } from '@/lib/ai/prompts'
import { chatWithClaude } from '@/lib/ai/claude'

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
    if (user) {
      loadReflections()
    }
  }, [user])

  const loadReflections = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setReflections((data || []).map(reflection => ({
      ...reflection,
      period_type: reflection.period_type as 'week' | 'month'
    })))
    setLoading(false)
  }

  const generateWeeklyReflection = async () => {
    if (!user) return

    setIsGenerating(true)

    try {
      // Get this week's data
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const [entriesResult, goalsResult] = await Promise.all([
        supabase.from('entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_date', weekAgo.toISOString()),
        supabase.from('goals')
          .select('*, categories(name)')
          .eq('user_id', user.id)
      ])

      const weeklyData = {
        entries: entriesResult.data || [],
        goals: goalsResult.data || [],
        moodTrends: calculateMoodTrends(entriesResult.data || []),
        topTags: calculateTopTags(entriesResult.data || [])
      }

      const prompt = getWeeklyReflectionPrompt(weeklyData)
      const response = await chatWithClaude([{ role: 'user', content: prompt }],
        'You are a compassionate reflection guide helping users understand their weekly journey.')

      // Save reflection
      const { data: reflection } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          period_type: 'week',
          start_date: weekAgo.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          summary: response.content,
          insights: weeklyData,
          metrics: {
            entriesCount: weeklyData.entries.length,
            goalsActive: weeklyData.goals.filter(g => g.status === 'active').length,
            avgMood: calculateAverageMood(entriesResult.data || [])
          }
        })
        .select()
        .single()

      if (reflection) {
        setCurrentReflection({
          ...reflection,
          period_type: reflection.period_type as 'week' | 'month'
        } as Reflection)
      }
      loadReflections() // Refresh list

    } catch (error) {
      console.error('Error generating reflection:', error)
      // TODO: Show error notification
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
      .sort(([,a], [,b]) => b - a)
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading reflections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Reflections
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Weekly insights into your journey and growth
            </p>
          </div>
          <button
            onClick={generateWeeklyReflection}
            disabled={isGenerating}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Weekly Reflection'}</span>
          </button>
        </div>

        {/* Current Week Reflection */}
        {currentReflection && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 mb-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                This Week's Reflection
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(currentReflection.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentReflection.summary}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentReflection.metrics?.entriesCount || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Journal Entries
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentReflection.metrics?.goalsActive || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Active Goals
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentReflection.metrics?.avgMood || 'N/A'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Average Mood
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Past Reflections */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Past Reflections
          </h2>

          {reflections.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🪞</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No reflections yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Generate your first weekly reflection to see patterns in your journey
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {reflection.period_type === 'week' ? 'Weekly' : 'Monthly'} Reflection
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(reflection.start_date).toLocaleDateString()} - {new Date(reflection.end_date).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap">
                    {reflection.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
