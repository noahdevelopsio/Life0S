'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageFeedbackProps {
    traceId: string;
    messageId?: string;
}

export function MessageFeedback({ traceId, messageId }: MessageFeedbackProps) {
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleFeedback(type: 'up' | 'down') {
        if (feedback || isSubmitting) return;

        setIsSubmitting(true);
        setFeedback(type);

        try {
            await fetch('/api/opik/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    traceId,
                    feedback: type,
                    comment: null,
                }),
            });
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setFeedback(null);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center gap-1 mt-2">
            <button
                onClick={() => handleFeedback('up')}
                disabled={feedback !== null}
                className={cn(
                    'p-1.5 rounded-md transition-all duration-200',
                    'hover:bg-primary/10 active:scale-95',
                    feedback === 'up' && 'text-green-500 bg-green-500/10',
                    feedback === 'down' && 'opacity-40 cursor-not-allowed',
                    feedback === null && 'text-slate-400 dark:text-slate-500'
                )}
                aria-label="Helpful"
            >
                <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
                onClick={() => handleFeedback('down')}
                disabled={feedback !== null}
                className={cn(
                    'p-1.5 rounded-md transition-all duration-200',
                    'hover:bg-red-500/10 active:scale-95',
                    feedback === 'down' && 'text-red-500 bg-red-500/10',
                    feedback === 'up' && 'opacity-40 cursor-not-allowed',
                    feedback === null && 'text-slate-400 dark:text-slate-500'
                )}
                aria-label="Not helpful"
            >
                <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            {feedback && (
                <span className="text-xs text-slate-500 ml-1.5 animate-in fade-in">
                    Thanks!
                </span>
            )}
        </div>
    );
}
