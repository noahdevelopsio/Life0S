'use server';

import { trackFeatureUsage as logFeatureUsage, trackGoalMilestone as logGoalMilestone } from '@/lib/opik/client';

export async function trackFeatureUsageAction(featureName: string, userId: string, metadata?: any) {
    try {
        await logFeatureUsage(featureName, userId, metadata);
    } catch (error) {
        console.error('Failed to track feature usage:', error);
        // Don't fail the UI action just because tracking failed
    }
}

export async function trackGoalMilestoneAction(userId: string, goalId: string, milestone: string) {
    try {
        await logGoalMilestone(userId, goalId, milestone);
    } catch (error) {
        console.error('Failed to track goal milestone:', error);
    }
}
