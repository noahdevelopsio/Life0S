export function getCompanionSystemPrompt(userPersonality: string = 'supportive'): string {
  const personalityTraits = {
    supportive: 'warm, encouraging, and understanding',
    direct: 'straightforward, focused, and efficient',
    warm: 'friendly, nurturing, and compassionate'
  }

  return `You are LifeOS, a personal AI companion designed to help users stay consistent with their goals through mindful reflection and gentle guidance.

Your personality: ${personalityTraits[userPersonality as keyof typeof personalityTraits] || personalityTraits.supportive}

Core principles:
- Be genuinely helpful and supportive
- Celebrate progress and normalize setbacks
- Ask thoughtful questions to deepen self-reflection
- Provide actionable suggestions, not just motivation
- Use data from user's journal entries and goals when relevant
- Maintain appropriate boundaries while being encouraging
- Use emojis sparingly and meaningfully
- Keep responses conversational but concise

Capabilities:
- Analyze journal entries for patterns and insights
- Provide goal-related advice and encouragement
- Help with reflection and self-discovery
- Offer mindfulness and wellness suggestions
- Assist with problem-solving and decision-making

Guidelines:
- Always validate user's feelings and experiences
- Focus on growth mindset and continuous improvement
- Be culturally sensitive and inclusive
- Respect privacy and maintain confidentiality
- Adapt communication style to user's preferences

Current context:
- User has chosen ${userPersonality} personality preference
- Focus on being their consistent, supportive companion`
}

export function getEntryAnalysisPrompt(entryContent: string, userContext?: {
  personality?: string
  recentGoals?: any[]
  recentEntries?: any[]
}): string {
  const contextInfo = userContext ? `
User context:
- Personality: ${userContext.personality || 'supportive'}
- Recent goals: ${userContext.recentGoals?.length || 0} active goals
- Recent entries: ${userContext.recentEntries?.length || 0} journal entries
` : ''

  return `Analyze this journal entry and provide insights:

${contextInfo}
Entry content:
"${entryContent}"

Provide a brief analysis including:
1. Overall sentiment and mood
2. Key themes or topics mentioned
3. Any patterns or insights worth noting
4. One gentle suggestion or reflection question
5. Relevant tags for categorization

Keep the analysis supportive and constructive. Focus on helping the user gain self-awareness.`
}

export function getGoalProgressPrompt(goalData: any, userEntries: any[]): string {
  return `Analyze this goal and provide encouraging insights:

Goal: "${goalData.title}"
Category: ${goalData.category}
Current progress: ${goalData.current_value}/${goalData.target_value}
Streak: ${goalData.streak} days
Frequency: ${goalData.frequency}

Recent journal entries related to this goal:
${userEntries.slice(0, 3).map(entry => `- ${entry.content.substring(0, 100)}...`).join('\n')}

Provide:
1. Encouraging progress assessment
2. One specific suggestion for improvement
3. Connection to user's journal reflections
4. Positive reinforcement of their efforts

Be supportive and focus on sustainable progress.`
}

export function getWeeklyReflectionPrompt(weeklyData: {
  entries: any[]
  goals: any[]
  moodTrends: any[]
  topTags: string[]
}): string {
  return `Generate a compassionate weekly reflection summary:

Weekly Data:
- Journal entries: ${weeklyData.entries.length}
- Goal progress: ${weeklyData.goals.filter(g => g.current_value > 0).length}/${weeklyData.goals.length} goals active
- Mood trend: ${weeklyData.moodTrends.join(' → ')}
- Top tags: ${weeklyData.topTags.join(', ')}

Structure your response:
1. Warm acknowledgment of their week
2. Key patterns or insights from entries
3. Goal progress highlights
4. One gentle suggestion for next week
5. Encouraging closing message

Be supportive, data-informed, and focused on growth. Keep it concise but meaningful.`
}

export function getConversationStarters(userContext: {
  personality?: string
  recentEntries?: number
  activeGoals?: number
  lastEntryDate?: string
}): string[] {
  const starters = [
    "How are you feeling today?",
    "What's been on your mind lately?",
    "How is your goal progress going?",
    "What's something you're grateful for?",
    "What challenges have you faced recently?",
    "What's a small win you'd like to celebrate?",
    "How can I support you today?",
    "What's your focus for today?"
  ]

  // Add personalized starters based on context
  if (userContext.activeGoals && userContext.activeGoals > 0) {
    starters.push("Tell me about your goals this week")
  }

  if (userContext.recentEntries && userContext.recentEntries === 0) {
    starters.push("Would you like to journal about something?")
  }

  return starters.slice(0, 8) // Return up to 8 suggestions
}
