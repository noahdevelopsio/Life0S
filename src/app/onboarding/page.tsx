'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'

const steps = [
  {
    id: 1,
    title: 'Welcome to LifeOS',
    description: 'Your personal AI companion for mindful productivity',
    content: (
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">🚀</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to LifeOS
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Let's set up your personal productivity sanctuary
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Choose Your AI Personality',
    description: 'Select how your AI companion should interact with you',
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Choose Your AI Personality
        </h2>
        <div className="grid gap-4">
          {[
            { id: 'supportive', name: 'Supportive', emoji: '🤗', desc: 'Encouraging and understanding' },
            { id: 'direct', name: 'Direct', emoji: '🎯', desc: 'Straightforward and focused' },
            { id: 'warm', name: 'Warm', emoji: '🌟', desc: 'Friendly and nurturing' }
          ].map(personality => (
            <label
              key={personality.id}
              className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="personality"
                value={personality.id}
                className="mr-4"
              />
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{personality.emoji}</span>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {personality.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {personality.desc}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Focus Areas',
    description: 'What areas of life do you want to focus on?',
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          What areas matter most to you?
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400">
          Select the categories you'll focus on (you can change this later)
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'health', name: 'Health & Fitness', emoji: '💪' },
            { id: 'learning', name: 'Learning', emoji: '📚' },
            { id: 'career', name: 'Career', emoji: '💼' },
            { id: 'relationships', name: 'Relationships', emoji: '❤️' },
            { id: 'personal', name: 'Personal Growth', emoji: '🌱' },
            { id: 'creativity', name: 'Creativity', emoji: '🎨' },
            { id: 'finance', name: 'Finance', emoji: '💰' },
            { id: 'spirituality', name: 'Spirituality', emoji: '🧘' }
          ].map(category => (
            <label
              key={category.id}
              className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                name="categories"
                value={category.id}
                className="mr-3"
              />
              <span className="text-xl mr-2">{category.emoji}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'First Goal',
    description: 'Set your first goal to get started',
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Let's Set Your First Goal
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What do you want to achieve?
            </label>
            <input
              type="text"
              placeholder="e.g., Exercise 3x per week"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              How often?
            </label>
            <select className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/50">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>
    )
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [personality, setPersonality] = useState('supportive')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [goalTitle, setGoalTitle] = useState('')
  const [goalFrequency, setGoalFrequency] = useState('daily')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { setUser } = useUserStore()

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if already onboarded
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded, ai_personality')
        .eq('id', user.id)
        .single()

      if (profile?.onboarded) {
        router.push('/dashboard')
        return
      }

      if (profile?.ai_personality) {
        setPersonality(profile.ai_personality)
      }
    }

    checkUser()
  }, [supabase, router])

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ai_personality: personality,
          onboarded: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create first goal if specified
      if (goalTitle.trim()) {
        const { error: goalError } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            title: goalTitle,
            frequency: goalFrequency as any,
            category_id: selectedCategories.length > 0 ?
              // Get first category ID (this is a simplified approach)
              (await supabase.from('categories').select('id').limit(1).single()).data?.id :
              null
          })

        if (goalError) throw goalError
      }

      // Update user store
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUser(profile)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      // Handle error (show notification)
    } finally {
      setLoading(false)
    }
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full mx-1 ${
                  index <= currentStep
                    ? 'bg-primary'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          {step.content}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Setting up...' : currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
