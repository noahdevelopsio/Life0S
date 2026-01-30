'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from '@/components/ai/MessageBubble';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { SuggestionChips } from '@/components/ai/SuggestionChips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';

export function ChatInterface({ conversationId }: { conversationId?: string }) { // conversationId optional for now
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: "Hi! I'm LifeOS. How can I support you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage], // Send history
                    conversationId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch response');
            }

            if (!response.body) throw new Error('No response body');

            // Add placeholder for streaming
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.chunk) {
                                assistantMessage += data.chunk;

                                setMessages(prev => {
                                    const updated = [...prev];
                                    const lastMsg = updated[updated.length - 1];
                                    if (lastMsg.role === 'assistant') {
                                        lastMsg.content = assistantMessage;
                                    }
                                    return updated;
                                });
                            }
                        } catch (e) { console.error("Parse error", e) }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const router = useRouter(); // Use the router hook

    return (
        <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent overflow-hidden relative">
            {/* Mobile Header */}
            <div className="flex-none flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 md:hidden bg-white dark:bg-slate-900 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="-ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                </Button>
                <div>
                    <h1 className="font-semibold text-lg">LifeOS AI</h1>
                    <p className="text-xs text-slate-500">Always here for you</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 w-full mb-0">
                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} message={msg} />
                ))}
                {isLoading && messages[messages.length - 1].content === '' && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {!isLoading && messages.length < 3 && (
                <div className="flex-none px-4 pb-2">
                    <SuggestionChips onSelect={(text: string) => { setInput(text); }} />
                </div>
            )}

            {/* Input */}
            <div className="flex-none p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 md:rounded-2xl md:shadow-lg md:mx-4 md:mb-4 z-10 w-full">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask LifeOS anything..."
                        className="flex-1 border-0 bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-0 px-4 rounded-xl"
                        autoFocus
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="rounded-full bg-primary h-10 w-10 shrink-0 shadow-sm"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
