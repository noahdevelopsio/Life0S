'use server';

import { createClient } from '@/lib/supabase/server';
import { geminiJSON } from '@/lib/ai/gemini';
import { getWeeklyReflectionPrompt } from '@/lib/ai/prompts';
import { revalidatePath } from 'next/cache';

export type GenerateReflectionResult = {
    success: boolean;
    message?: string;
    data?: any;
};

export async function generateWeeklyReflectionAction(): Promise<GenerateReflectionResult> {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        // 2. Fetch Data (Entries & Goals)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [entriesResult, goalsResult] = await Promise.all([
            supabase.from('entries')
                .select('*')
                .eq('user_id', user.id)
                .gte('entry_date', weekAgo.toISOString()),
            supabase.from('goals')
                .select('*, categories(name)')
                .eq('user_id', user.id)
        ]);

        if (entriesResult.error) throw new Error(`Entries error: ${entriesResult.error.message}`);
        if (goalsResult.error) throw new Error(`Goals error: ${goalsResult.error.message}`);

        const entries = entriesResult.data || [];
        const goals = goalsResult.data || [];

        // 3. Prepare Data for AI
        // We need to match the structure expected by CHAT_CONTEXT_BUILDER in prompts.ts
        const weeklyStats = {
            totalEntries: entries.length,
            goalsHit: goals.filter(g => (g.current_value || 0) >= (g.target_value || 1)).length,
            totalGoals: goals.length,
            topCategories: calculateTopTags(entries) // Reuse logic or simplify
        };

        const userData = {
            recentEntries: entries.map(e => ({
                entry_date: e.entry_date,
                content: e.content
            })),
            activeGoals: goals.map(g => ({
                title: g.title,
                frequency: g.frequency,
                current_value: g.current_value,
                target_value: g.target_value,
                streak: g.streak
            })),
            weeklyStats
        };

        // 4. Generate Content with Gemini
        const prompt = getWeeklyReflectionPrompt(userData);

        // Define the expected output structure for JSON mode
        // The prompt instruction in prompts.ts might need valid JSON enforcement
        // For now, prompt.ts uses 'getWeeklyReflectionPrompt' which returns a string string.
        // geminiJSON expects a system instruction and a user prompt.
        // The prompts.ts 'getWeeklyReflectionPrompt' combines them.
        // We should split them or just use the combined prompt as user prompt.

        // Let's rely on the instruction being embedded. 
        // Wait, geminiJSON takes (prompt, systemInstruction).
        // prompts.ts has WEEKLY_REFLECTION_INSTRUCTION.

        const systemInstruction = `You are LifeOS, a personal AI companion. Generate a weekly reflection in strict JSON format.
    The JSON structure should be:
    {
      "summary": "markdown string of the narrative summary",
      "insights": ["insight 1", "insight 2"],
      "metrics": { "entriesCount": number, "goalsActive": number, "avgMood": "string" }
    }
    `;

        // We might need to adjust the prompt to explicitly ask for JSON if the imported prompt doesn't.
        // The imported `getWeeklyReflectionPrompt` builds a text prompt.
        // Let's modify the call to `geminiJSON` to ensure we get JSON.

        const aiResponse = await geminiJSON<{
            summary: string;
            insights: string[];
            metrics: {
                entriesCount: number;
                goalsActive: number;
                avgMood: string;
            }
        }>(prompt + "\n\nIMPORTANT: Output ONLY valid JSON matching the structure: { summary: string, insights: string[], metrics: { entriesCount: number, goalsActive: number, avgMood: string } }", systemInstruction);


        // 5. Save to Database
        const { error: insertError } = await supabase
            .from('reflections')
            .insert({
                user_id: user.id,
                period_type: 'week',
                start_date: weekAgo.toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                summary: aiResponse.summary,
                insights: aiResponse.insights, // Store as jsonb
                metrics: {
                    ...aiResponse.metrics,
                    generated_at: new Date().toISOString()
                }
            });

        if (insertError) throw insertError;

        revalidatePath('/reflections');
        return { success: true };

    } catch (error: any) {
        console.error('Server Action Error:', error);
        return { success: false, message: error.message };
    }
}

// Helpers
function calculateTopTags(entries: any[]) {
    const tagCount: Record<string, number> = {}
    entries.forEach(entry => {
        if (entry.tags) {
            entry.tags.forEach((tag: string) => {
                tagCount[tag] = (tagCount[tag] || 0) + 1
            })
        }
    })
    return Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([tag]) => tag)
}
