'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

type Entry = {
  id: string
  content: string
  mood: string | null
  entry_date: string
  tags: string[] | null
  is_favorite: boolean | null
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const { user } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user])

  useEffect(() => {
    filterEntries()
  }, [entries, selectedTag, selectedMood, searchQuery])

  const loadEntries = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })

    setEntries(data || [])
    setLoading(false)
  }

  const filterEntries = () => {
    let filtered = [...entries]

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(entry =>
        entry.tags && entry.tags.includes(selectedTag)
      )
    }

    // Filter by mood
    if (selectedMood) {
      filtered = filtered.filter(entry => entry.mood === selectedMood)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredEntries(filtered)
  }

  const getMoodEmoji = (mood: string | null) => {
    switch (mood) {
      case 'great': return '😊'
      case 'good': return '🙂'
      case 'okay': return '😐'
      case 'bad': return '😔'
      case 'terrible': return '😢'
      default: return '📝'
    }
  }

  const allTags = Array.from(
    new Set(entries.flatMap(entry => entry.tags || []))
  ).sort()

  const allMoods = Array.from(
    new Set(entries.map(entry => entry.mood).filter(Boolean))
  ).sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your timeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Life Timeline
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your journey through time - every entry, every moment
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search entries
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your thoughts..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by tag
              </label>
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">All tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>

            {/* Mood Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by mood
              </label>
              <select
                value={selectedMood || ''}
                onChange={(e) => setSelectedMood(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">All moods</option>
                {allMoods.map(mood => (
                  <option key={mood} value={mood}>
                    {getMoodEmoji(mood)} {mood}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(selectedTag || selectedMood || searchQuery) && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {selectedTag && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  #{selectedTag}
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="ml-2 text-primary hover:text-primary/80"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMood && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  {getMoodEmoji(selectedMood)} {selectedMood}
                  <button
                    onClick={() => setSelectedMood(null)}
                    className="ml-1 text-primary hover:text-primary/80"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-primary hover:text-primary/80"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {entries.length === 0 ? 'No entries yet' : 'No entries match your filters'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {entries.length === 0
                  ? 'Start journaling to see your life timeline'
                  : 'Try adjusting your filters to see more entries'
                }
              </p>
              {entries.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedTag(null)
                    setSelectedMood(null)
                    setSearchQuery('')
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

              {filteredEntries.map((entry, index) => {
                const entryDate = new Date(entry.entry_date)
                const isFirstOfDay = index === 0 ||
                  new Date(filteredEntries[index - 1].entry_date).toDateString() !== entryDate.toDateString()

                return (
                  <div key={entry.id} className="relative flex items-start space-x-6">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 border-4 border-primary rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Date header */}
                      {isFirstOfDay && (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {entryDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                        </div>
                      )}

                      {/* Entry card */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {entryDate.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            {entry.is_favorite && (
                              <span className="text-yellow-500" title="Favorite">⭐</span>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-900 dark:text-white mb-4 leading-relaxed">
                          {entry.content}
                        </p>

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
