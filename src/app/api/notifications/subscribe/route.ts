
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const subscription = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) { }
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if subscriptions table exists, if not, you might need to use profiles or a meta column
        // For this implementation, we will assume a 'push_subscriptions' table or store in 'profiles' metadata
        // Since we didn't create a table yet, let's use a JSONB column in profiles if available or creating a new table is better.
        // Let's CREATE a new table query in the response for the user to run, similar to persistence.
        // But for now, let's try to insert into 'push_subscriptions' and catch error.

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                subscription: subscription,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' }); // Assuming one sub per user for simplicity, or we can key by endpoint

        if (error) {
            console.log("Error saving subscription (table might be missing):", error);
            // Fail silently or modify schema. 
            // We will assume table needs creation.
            return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
