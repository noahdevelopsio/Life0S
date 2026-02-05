'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VoiceInput } from './VoiceInput';
import { TagSelector } from './TagSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const entrySchema = z.object({
  content: z.string().min(5, 'Entry must be at least 5 characters'),
  mood: z.enum(['great', 'good', 'okay', 'bad', 'terrible']).optional(),
  tags: z.array(z.string()).optional(),
});

type EntryFormData = z.infer<typeof entrySchema>;

export function EntryEditor({ onSave, initialContent = '', initialMode = 'text' }: { onSave: (data: any) => Promise<void>, initialContent?: string, initialMode?: 'text' | 'voice' }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<any>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      content: initialContent,
      tags: [],
    }
  });

  const content = watch('content');

  // Auto-analyze content as user types (debounced)
  useEffect(() => {
    if (!content || content.length < 50) return;

    const timer = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        // Call our internal API instead of direct geminiJSON to keep secrets safe
        const response = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) throw new Error('Analysis failed');

        const suggestions = await response.json();
        setAutoSuggestions(suggestions);

        // Auto-fill suggestions but dont overwrite if user manually selected (simplified logic)
        if (suggestions.tags && (!watch('tags') || watch('tags')?.length === 0)) {
          setValue('tags', suggestions.tags);
        }
        if (suggestions.mood && !watch('mood')) {
          setValue('mood', suggestions.mood as any);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, setValue, watch]);

  const onSubmit = async (data: EntryFormData) => {
    await onSave({
      ...data,
      ai_summary: autoSuggestions?.summary,
    });
  };

  const handleVoiceInput = (text: string) => {
    const current = content || '';
    setValue('content', current + (current ? ' ' : '') + text);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">New Entry</h2>
        <VoiceInput onTranscript={handleVoiceInput} autoStart={initialMode === 'voice'} />
      </div>

      <Textarea
        {...register('content')}
        placeholder="What happened today?"
        className="min-h-[300px] text-lg leading-relaxed resize-none p-4"
        autoFocus
      />

      {errors.content && (
        <p className="text-sm text-red-500">{errors.content.message}</p>
      )}

      {isAnalyzing && (
        <div className="flex items-center text-sm text-primary animate-pulse">
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Analyzing your entry with AI...
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Mood</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'great', label: 'Great', emoji: '🤩', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
              { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
              { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
              { value: 'bad', label: 'Bad', emoji: '😕', color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
              { value: 'terrible', label: 'Terrible', emoji: '😫', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
            ].map((option) => {
              const isSelected = watch('mood') === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('mood', option.value as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 w-20 h-20 gap-1",
                    isSelected
                      ? cn(option.color, "ring-2 ring-offset-2 ring-primary/20 scale-105 shadow-sm")
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <TagSelector
            selectedTags={watch('tags') || []}
            onTagsChange={(tags) => setValue('tags', tags)}
            suggestions={autoSuggestions?.tags || []}
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Entry...
          </>
        ) : (
          'Save Entry'
        )}
      </Button>
    </form>
  );
}
