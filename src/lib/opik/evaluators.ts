import { opik } from './client';

/**
 * Evaluate how supportive and encouraging the AI response is
 * Higher score = more supportive, non-judgmental tone
 */
export async function evaluateSupportiveness(
    traceId: string,
    aiResponse: string
): Promise<number> {
    const supportiveWords = [
        'great', 'excellent', 'proud', 'progress', 'growth',
        'consistent', 'amazing', 'wonderful', 'improving', 'success',
        'achievement', 'celebrate', 'fantastic', 'brilliant', 'awesome',
        'well done', 'keep going', 'you\'ve got this', 'believe', 'strength'
    ];

    const negativeWords = [
        'failed', 'terrible', 'bad', 'disappointing', 'quit',
        'gave up', 'useless', 'pathetic', 'waste', 'failure',
        'lazy', 'shame', 'should have', 'wrong'
    ];

    const responseLower = aiResponse.toLowerCase();
    const words = responseLower.split(/\s+/);

    const supportiveCount = supportiveWords.filter(w =>
        responseLower.includes(w)
    ).length;

    const negativeCount = negativeWords.filter(w =>
        responseLower.includes(w)
    ).length;

    // Calculate score: more supportive = higher, more negative = lower
    const rawScore = (supportiveCount - negativeCount * 2) / Math.max(words.length / 10, 1);
    const score = Math.max(0, Math.min(1, rawScore + 0.5)); // Normalize to 0-1

    await opik.score({
        traceId,
        name: 'supportiveness_score',
        value: score,
        metadata: {
            supportive_words_count: supportiveCount,
            negative_words_count: negativeCount,
            total_words: words.length,
            target: 0.7,
        },
    });

    return score;
}

/**
 * Evaluate how actionable the AI response is
 * Higher score = provides concrete next steps and suggestions
 */
export async function evaluateActionability(
    traceId: string,
    aiResponse: string
): Promise<number> {
    const actionablePatterns = [
        /try/gi, /consider/gi, /you could/gi, /you might/gi,
        /suggestion/gi, /recommend/gi, /next time/gi, /tomorrow/gi,
        /this week/gi, /start by/gi, /begin with/gi, /focus on/gi,
        /goal/gi, /plan/gi, /schedule/gi, /set aside/gi,
        /step\s?\d/gi, /first/gi, /then/gi, /after that/gi
    ];

    let actionableCount = 0;
    actionablePatterns.forEach(pattern => {
        const matches = aiResponse.match(pattern);
        if (matches) actionableCount += matches.length;
    });

    // Score based on number of actionable phrases (cap at 6)
    const score = Math.min(1, actionableCount / 6);

    await opik.score({
        traceId,
        name: 'actionability_score',
        value: score,
        metadata: {
            actionable_phrases_count: actionableCount,
            target: 0.6,
        },
    });

    return score;
}

/**
 * Evaluate how personalized the AI response is
 * Higher score = uses user-specific context effectively
 */
export async function evaluatePersonalization(
    traceId: string,
    aiResponse: string,
    userContext: {
        userName?: string;
        activeGoals?: Array<{ title: string }>;
        currentStreak?: number;
        preferredCategories?: string[];
    }
): Promise<number> {
    const responseLower = aiResponse.toLowerCase();

    const mentionsName = userContext.userName
        ? responseLower.includes(userContext.userName.toLowerCase())
        : false;

    const mentionsGoals = userContext.activeGoals?.some(goal =>
        responseLower.includes(goal.title.toLowerCase())
    ) || false;

    const mentionsStreak = userContext.currentStreak && userContext.currentStreak > 0
        ? (responseLower.includes('streak') || responseLower.includes(userContext.currentStreak.toString()))
        : false;

    const mentionsCategories = userContext.preferredCategories?.some(cat =>
        responseLower.includes(cat.toLowerCase())
    ) || false;

    // Calculate score
    const personalElements = [
        mentionsName,
        mentionsGoals,
        mentionsStreak,
        mentionsCategories,
    ].filter(Boolean).length;

    const score = personalElements / 4;

    await opik.score({
        traceId,
        name: 'personalization_score',
        value: score,
        metadata: {
            mentions_name: mentionsName,
            mentions_goals: mentionsGoals,
            mentions_streak: mentionsStreak,
            mentions_categories: mentionsCategories,
            personal_elements_count: personalElements,
            target: 0.5,
        },
    });

    return score;
}

/**
 * Evaluate response length appropriateness
 * Optimal responses are informative but not overwhelming
 */
export async function evaluateResponseLength(
    traceId: string,
    aiResponse: string,
    expectedRange: { min: number; max: number } = { min: 100, max: 800 }
): Promise<number> {
    const length = aiResponse.length;

    let score = 1;
    if (length < expectedRange.min) {
        score = length / expectedRange.min;
    } else if (length > expectedRange.max) {
        score = Math.max(0.5, expectedRange.max / length);
    }

    await opik.score({
        traceId,
        name: 'response_length_score',
        value: score,
        metadata: {
            response_length: length,
            expected_min: expectedRange.min,
            expected_max: expectedRange.max,
            is_appropriate: score >= 0.8,
        },
    });

    return score;
}

/**
 * Calculate overall quality score (weighted composite)
 * This runs all evaluators and returns a single quality metric
 */
export async function evaluateOverallQuality(
    traceId: string,
    aiResponse: string,
    userContext: {
        userName?: string;
        activeGoals?: Array<{ title: string }>;
        currentStreak?: number;
        preferredCategories?: string[];
    }
): Promise<number> {
    // Run all evaluations in parallel
    const [supportiveness, actionability, personalization, lengthScore] = await Promise.all([
        evaluateSupportiveness(traceId, aiResponse),
        evaluateActionability(traceId, aiResponse),
        evaluatePersonalization(traceId, aiResponse, userContext),
        evaluateResponseLength(traceId, aiResponse),
    ]);

    // Weighted average (customize weights based on importance)
    const overallScore = (
        supportiveness * 0.35 +      // 35% - Encouraging tone is key for LifeOS
        actionability * 0.30 +        // 30% - Helps users take action
        personalization * 0.20 +      // 20% - Makes it personal
        lengthScore * 0.15            // 15% - Appropriate response size
    );

    await opik.score({
        traceId,
        name: 'overall_quality_score',
        value: overallScore,
        metadata: {
            supportiveness_score: supportiveness,
            actionability_score: actionability,
            personalization_score: personalization,
            length_score: lengthScore,
            weighted_average: overallScore,
            target: 0.7,
            weights: {
                supportiveness: 0.35,
                actionability: 0.30,
                personalization: 0.20,
                length: 0.15,
            },
        },
    });

    return overallScore;
}
