'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { trackFeatureUsageAction } from '@/actions/tracking';
import { Spinner } from '@/components/ui/spinner';

function JournalEditorWrapper() {
  const searchParams = useSearchParams();
  const initialContent = searchParams.get('initial') || '';
  const router = useRouter();
  const { user } = useUser();

  const handleSave = async (data: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('entries').insert({
        user_id: user.id,
        content: data.content,
        mood: data.mood,
        tags: data.tags,
        ai_summary: data.ai_summary,
      });

      if (error) throw error;

      await trackFeatureUsageAction('journal_entry_created', user.id);

      router.push('/journal');
      router.refresh();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  return <EntryEditor onSave={handleSave} initialContent={initialContent} />;
}

export default function NewEntryPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }>
        <JournalEditorWrapper />
      </Suspense>
    </div>
  );
}
