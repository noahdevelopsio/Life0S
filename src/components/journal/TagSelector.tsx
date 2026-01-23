'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagSelector({ selectedTags, onTagsChange, suggestions = [] }: TagSelectorProps) {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (inputValue.trim() && !selectedTags.includes(inputValue.trim())) {
      onTagsChange([...selectedTags, inputValue.trim()]);
    }
    setInputValue('');
    setInputVisible(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            {tag}
            <button type="button" onClick={() => toggleTag(tag)} className="hover:text-primary/70">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {inputVisible ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              onBlur={() => inputValue ? addCustomTag() : setInputVisible(false)}
              className="h-7 w-32 text-xs"
              placeholder="New tag..."
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setInputVisible(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 text-sm hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Tag
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
          <span>Suggestions:</span>
          {suggestions.filter(s => !selectedTags.includes(s)).map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => toggleTag(suggestion)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
