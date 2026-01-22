'use client'

import { useState } from 'react'

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

const suggestedTags = [
  'work', 'personal', 'health', 'relationships', 'learning',
  'creativity', 'goals', 'reflection', 'gratitude', 'challenges',
  'success', 'growth', 'family', 'friends', 'travel'
]

export default function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setShowSuggestions(value.length > 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(selectedTags[selectedTags.length - 1])
    }
  }

  const filteredSuggestions = suggestedTags.filter(
    tag => !selectedTags.includes(tag) &&
    tag.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-primary hover:text-primary/80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags (press Enter or comma to add)"
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Tags help you organize and find your entries later. Start typing or choose from suggestions.
      </p>
    </div>
  )
}
