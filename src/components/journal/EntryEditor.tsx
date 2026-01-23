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

export function EntryEditor({ onSave, initialContent = '' }: { onSave: (data: any) => Promise<void>, initialContent?: string }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<any>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EntryFormData>({
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
        <VoiceInput onTranscript={handleVoiceInput} />
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
            {['great', 'good', 'okay', 'bad', 'terrible'].map((mood) => (
              <Button
                key={mood}
                type="button"
                variant={watch('mood') === mood ? 'default' : 'outline'}
                onClick={() => setValue('mood', mood as any)}
                className="capitalize"
              >
                {mood}
              </Button>
            ))}
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

      <Button type="submit" size="lg" className="w-full h-12 text-lg">
        Save Entry
      </Button>
    </form>
  );
}
