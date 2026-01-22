'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { useThemeStore } from '@/store/themeStore'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Goal = Database['public']['Tables']['goals']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
}
type Entry = Database['public']['Tables']['entries']['Row']

interface DashboardClientProps {
  initialProfile: Profile
  initialGoals: Goal[]
  initialEntries: Entry[]
}

export default function DashboardClient({
  initialProfile,
  initialGoals,
  initialEntries
}: DashboardClientProps) {
  const [goals, setGoals] = useState(initialGoals)
  const [entries, setEntries] = useState(initialEntries)
  const { user, setUser } = useUserStore()
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    // Update user store with initial profile data
    if (initialProfile && !user) {
      setUser(initialProfile)
    }
  }, [initialProfile, user, setUser])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg">👋</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                {greeting()}, {initialProfile?.full_name || 'there'}!
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ready to make today amazing?
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/ai"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary"
              title="AI Companion"
            >
              🤖
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Settings">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 space-y-8">
        {/* Goals Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Your Goals
            </h2>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
              + Add Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No goals yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Set your first goal to start tracking your progress
              </p>
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg">
                          {goal.categories?.icon ? goal.categories.icon : '🎯'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {goal.categories?.name || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {goal.current_value || 0}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        of {goal.target_value || '∞'}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((goal.current_value || 0) / (goal.target_value || 1)) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>🔥 {goal.streak || 0} day streak</span>
                    <span>{goal.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Entries */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Recent Journal
            </h2>
            <Link href="/journal/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
              Write Entry
            </Link>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No entries yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start journaling to capture your thoughts and experiences
              </p>
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                Write Your First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {entry.mood === 'great' && '😊'}
                        {entry.mood === 'good' && '🙂'}
                        {entry.mood === 'okay' && '😐'}
                        {entry.mood === 'bad' && '😔'}
                        {entry.mood === 'terrible' && '😢'}
                        {!entry.mood && '📝'}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.is_favorite && <span className="text-yellow-500">⭐</span>}
                  </div>

                  <p className="text-slate-900 dark:text-white mb-3 line-clamp-3">
                    {entry.content.length > 150
                      ? `${entry.content.substring(0, 150)}...`
                      : entry.content
                    }
                  </p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center text-2xl">
        +
      </button>
    </div>
  )
}
