'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DailySummaryCard } from '@/components/dashboard/DailySummaryCard';
import { GoalsOverview } from '@/components/dashboard/GoalsOverview';
import { QuickEntryWidget } from '@/components/dashboard/QuickEntryWidget';
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap';
import { useUser } from '@/lib/hooks/useUser';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardPage() {
  const { user } = useUser();
  const [goals, setGoals] = useState([]);
  const [todayEntries, setTodayEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simplified data loading without Opik for now to ensure base functionality first
  useEffect(() => {
    if (!user) return;

    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    try {
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id) // user is guaranteed if this runs
        .eq('status', 'active')
        .limit(5);

      const { data: entriesData } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user!.id)
        .gte('entry_date', new Date().toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      setGoals(goalsData || []);
      setTodayEntries(entriesData || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <DashboardHeader userName={user?.user_metadata?.full_name || user?.email} />

      {/* Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickEntryWidget onEntryCreated={loadDashboardData} />
          <div className="h-6"></div> {/* Spacer */}
          <DailySummaryCard entries={todayEntries} />
        </div>

        <div className="space-y-6 flex flex-col">
          <GoalsOverview goals={goals} />
          <CalendarHeatmap userId={user?.id || ''} />
        </div>
      </div>
    </div>
  );
}
