'use client';

import { cn } from '@/lib/utils';

export function MessageBubble({ message }: { message: { role: string; content: string } }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[80%] rounded-2xl p-4 shadow-sm leading-relaxed whitespace-pre-wrap",
                    isUser
                        ? "bg-[#5A7C5F] text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                )}
            >
                {message.content}
            </div>
        </div>
    );
}
