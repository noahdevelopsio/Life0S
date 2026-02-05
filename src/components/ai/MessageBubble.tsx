import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { MessageFeedback } from './MessageFeedback';

interface MessageBubbleProps {
    message: {
        role: 'user' | 'assistant' | 'model';
        content: string;
        id?: string;
    };
    traceId?: string;
}

export function MessageBubble({ message, traceId }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
            <div className={cn(
                "flex max-w-[80%] md:max-w-[70%] gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isUser ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-primary"
                )}>
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        isUser
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none"
                    )}>
                        {isUser ? (
                            <p>{message.content}</p>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Feedback for AI messages */}
                    {!isUser && traceId && (
                        <MessageFeedback traceId={traceId} messageId={message.id} />
                    )}
                </div>
            </div>
        </div>
    );
}
