import { opik, getUserMetadata } from './client';

/**
 * Track goal milestone achievements with AI interaction correlation
 */
export async function trackGoalMilestoneWithAI(
    userId: string,
    goalId: string,
    milestone: string,
    aiInteractionsLast7Days: number
) {
    await opik.log({
        name: 'goal-milestone-achieved',
        properties: {
            ...getUserMetadata(userId),
            goalId,
            milestone,
            ai_interactions_last_7days: aiInteractionsLast7Days,
            ai_engagement_level: aiInteractionsLast7Days > 5 ? 'high' :
                aiInteractionsLast7Days > 2 ? 'medium' : 'low',
        },
    });
}

/**
 * Track streak events (maintained, broken, milestone reached)
 */
export async function trackStreakEvent(
    userId: string,
    eventType: 'maintained' | 'broken' | 'milestone',
    currentStreak: number,
    lastAIChatDaysAgo: number
) {
    await opik.log({
        name: 'streak-event',
        properties: {
            ...getUserMetadata(userId),
            eventType,
            currentStreak,
            last_ai_chat_days_ago: lastAIChatDaysAgo,
            ai_engagement_level: lastAIChatDaysAgo < 2 ? 'high' :
                lastAIChatDaysAgo < 5 ? 'medium' : 'low',
            milestone_reached: eventType === 'milestone' ? currentStreak : null,
        },
    });
}

/**
 * Track goal completion with AI support analysis
 */
export async function trackGoalCompletion(
    userId: string,
    goalId: string,
    goalTitle: string,
    daysToComplete: number,
    totalAIInteractions: number
) {
    // Calculate AI support level based on interactions relative to days
    const interactionsPerDay = totalAIInteractions / Math.max(daysToComplete, 1);
    const aiSupportLevel = interactionsPerDay > 0.5 ? 'high' :
        interactionsPerDay > 0.2 ? 'medium' : 'low';

    await opik.log({
        name: 'goal-completed',
        properties: {
            ...getUserMetadata(userId),
            goalId,
            goalTitle,
            days_to_complete: daysToComplete,
            total_ai_interactions: totalAIInteractions,
            interactions_per_day: interactionsPerDay.toFixed(2),
            ai_support_level: aiSupportLevel,
        },
    });
}

/**
 * Track journal entry creation with AI assistance info
 */
export async function trackJournalEntry(
    userId: string,
    entryId: string,
    wasAISuggestionUsed: boolean,
    mood?: string,
    tagsCount?: number
) {
    await opik.log({
        name: 'journal-entry-created',
        properties: {
            ...getUserMetadata(userId),
            entryId,
            ai_suggestion_used: wasAISuggestionUsed,
            mood,
            tags_count: tagsCount || 0,
        },
    });
}

/**
 * Track AI interaction patterns for user engagement analysis
 */
export async function trackAIInteraction(
    userId: string,
    interactionType: 'chat' | 'summarize' | 'reflection' | 'suggestion',
    success: boolean,
    duration?: number
) {
    await opik.log({
        name: 'ai-interaction',
        properties: {
            ...getUserMetadata(userId),
            interaction_type: interactionType,
            success,
            duration_ms: duration,
        },
    });
}
