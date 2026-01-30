'use client'

import { Smile, Meh, Frown, CloudRain } from 'lucide-react'

type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible'

interface MoodOption {
  value: MoodType
  label: string
  icon: React.ElementType
  color: string
}

interface MoodSelectorProps {
  selectedMood: MoodType | null
  onMoodSelect: (mood: MoodType | null) => void
}

const moodOptions: MoodOption[] = [
  { value: 'great', label: 'Great', icon: Smile, color: 'bg-green-500' },
  { value: 'good', label: 'Good', icon: Smile, color: 'bg-blue-500' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'bg-yellow-500' },
  { value: 'bad', label: 'Bad', icon: Frown, color: 'bg-orange-500' },
  { value: 'terrible', label: 'Terrible', icon: CloudRain, color: 'bg-red-500' }
]

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {moodOptions.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onMoodSelect(selectedMood === mood.value ? null : mood.value)}
          className={`aspect-square rounded-xl flex flex-col items-center justify-center p-3 transition-all ${selectedMood === mood.value
            ? `${mood.color} text-white shadow-lg scale-105`
            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400'
            }`}
        >
          <mood.icon className="w-8 h-8 mb-1" />
          <span className={`text-xs font-medium ${selectedMood === mood.value ? 'text-white' : ''
            }`}>
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  )
}
