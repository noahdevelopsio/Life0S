'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { trackGoalMilestoneAction } from '@/actions/tracking';

export default function GoalsPage() {
    const { user } = useUser();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadGoals();
    }, [user]);

    async function loadGoals() {
        const { data } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user!.id)
            .eq('status', 'active');

        setGoals(data || []);
        setLoading(false);
    }

    const handleLogProgress = async (goalId: string) => {
        // Optimistic update
        setGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    current_value: Math.min((g.current_value || 0) + 1, g.target_value || 1)
                };
            }
            return g;
        }));

        try {
            const goal = goals.find(g => g.id === goalId);
            if (!goal) return;

            const newValue = Math.min((goal.current_value || 0) + 1, goal.target_value || 1);

            await supabase.from('goals').update({ current_value: newValue }).eq('id', goalId);
            await supabase.from('goal_logs').insert({
                user_id: user!.id,
                goal_id: goalId,
                value: 1
            });

            if (newValue >= goal.target_value) {
                await trackGoalMilestoneAction(user!.id, goalId, 'daily_target_hit');
            }
        } catch (error) {
            console.error(error);
            loadGoals(); // Revert
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Goals & Habits</h1>
                    <p className="text-slate-500">Track your progress and build consistency.</p>
                </div>
                <AddGoalModal onGoalCreated={loadGoals} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div>Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl">
                        No active goals. Create one to get started!
                    </div>
                ) : (
                    goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onLogProgress={handleLogProgress} />
                    ))
                )}
            </div>
        </div>
    );
}
