'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { chatWithClaude, streamClaudeResponse, ClaudeMessage } from '@/lib/ai/claude'
import { getCompanionSystemPrompt, getConversationStarters } from '@/lib/ai/prompts'
import AIChatInterface from '@/components/ai/AIChatInterface'

export default function AIPage() {
  const [messages, setMessages] = useState<ClaudeMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const router = useRouter()
  const supabase = createClient()
  const { user } = useUserStore()
  const hasInitialized = useRef(false)

  // Initialize conversation and load data
  useEffect(() => {
    if (!user || hasInitialized.current) return
    hasInitialized.current = true

    const initializeConversation = async () => {
      try {
        // Get or create conversation
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        let currentConversationId: string

        if (existingConversation) {
          currentConversationId = existingConversation.id
          setConversationId(currentConversationId)

          // Load existing messages
          const { data: existingMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', currentConversationId)
            .order('created_at', { ascending: true })

          if (existingMessages) {
            const formattedMessages: ClaudeMessage[] = existingMessages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            }))
            setMessages(formattedMessages)
          }
        } else {
          // Create new conversation
          const { data: newConversation, error } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              title: 'AI Companion Chat'
            })
            .select()
            .single()

          if (error) throw error
          currentConversationId = newConversation.id
          setConversationId(currentConversationId)
        }

        // Get user context for suggestions
        const [goalsResult, entriesResult] = await Promise.all([
          supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
          supabase.from('entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(5)
        ])

        const userContext = {
          personality: user.ai_personality || 'supportive',
          recentEntries: entriesResult.data?.length || 0,
          activeGoals: goalsResult.data?.length || 0,
          lastEntryDate: entriesResult.data?.[0]?.entry_date
        }

        setSuggestions(getConversationStarters(userContext))

      } catch (error) {
        console.error('Error initializing conversation:', error)
        router.push('/dashboard')
      }
    }

    initializeConversation()
  }, [user, router, supabase])

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return

    const userMessage: ClaudeMessage = { role: 'user', content: content.trim() }

    // Add user message to state
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Save user message to database
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: content.trim()
      })

      // Get AI response
      const systemPrompt = getCompanionSystemPrompt(user.ai_personality || 'supportive')
      const response = await chatWithClaude([...messages, userMessage], systemPrompt)

      const assistantMessage: ClaudeMessage = {
        role: 'assistant',
        content: response.content
      }

      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message to database
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content,
        metadata: {
          usage: response.usage,
          model: 'claude-3-sonnet'
        }
      })

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ClaudeMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <AIChatInterface
      messages={messages}
      suggestions={suggestions}
      onSendMessage={sendMessage}
      isLoading={isLoading}
    />
  )
}
