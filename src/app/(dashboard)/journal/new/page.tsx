'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import VoiceRecorder from '@/components/journal/VoiceRecorder'
import TagSelector from '@/components/journal/TagSelector'
import MoodSelector from '@/components/journal/MoodSelector'
import EntryEditor from '@/components/journal/EntryEditor'

type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible'

export default function NewEntryPage() {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<MoodType | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [transcription, setTranscription] = useState('')

  const router = useRouter()
  const supabase = createClient()
  const { user } = useUserStore()

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSave = async () => {
    if (!user || !content.trim()) return

    setIsSaving(true)

    try {
      // Create the entry
      const { data: entry, error } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          content: content.trim(),
          mood,
          tags: tags.length > 0 ? tags : null,
          entry_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Navigate to the entry view
      router.push(`/journal/${entry.id}`)
    } catch (error) {
      console.error('Error saving entry:', error)
      // TODO: Show error notification
    } finally {
      setIsSaving(false)
    }
  }

  const handleTranscription = (text: string) => {
    setTranscription(text)
    // Append transcription to existing content
    setContent(prev => prev + (prev ? '\n\n' : '') + text)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              ←
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                New Journal Entry
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 space-y-8">
        {/* Voice Recorder */}
        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Voice Input
          </h2>
          <VoiceRecorder
            onTranscription={handleTranscription}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        </section>

        {/* Mood Selector */}
        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            How are you feeling?
          </h2>
          <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
        </section>

        {/* Tags */}
        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Tags
          </h2>
          <TagSelector selectedTags={tags} onTagsChange={setTags} />
        </section>

        {/* Content Editor */}
        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <EntryEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your thoughts..."
          />
        </section>

        {/* Auto-save indicator */}
        {content && (
          <div className="text-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Auto-saving enabled
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
