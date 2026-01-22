import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  // This will be a server component that fetches initial data
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial data for the dashboard
  const [profileResult, goalsResult, entriesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('goals').select('*, categories(name, icon, color)').eq('user_id', user.id).eq('status', 'active'),
    supabase.from('entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(5)
  ])

  const profile = profileResult.data
  const goals = goalsResult.data || []
  const recentEntries = entriesResult.data || []

  // Check if user needs onboarding
  if (!profile?.onboarded) {
    redirect('/onboarding')
  }

  return (
    <DashboardClient
      initialProfile={profile}
      initialGoals={goals}
      initialEntries={recentEntries}
    />
  )
}
