import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_ID = process.argv[2];

if (!USER_ID) {
    console.error('Please provide a User ID as an argument');
    process.exit(1);
}

const SAMPLE_ENTRIES = [
    {
        content: "Had a really productive day today! Finished the big presentation and felt good about it. Went for a run in the evening which cleared my head.",
        mood: "great",
        tags: ["work", "fitness", "productivity"],
        offset: 0 // Today
    },
    {
        content: "Feeling a bit sluggish. Didn't sleep well. Struggled to focus on coding tasks. Need to prioritize sleep tonight.",
        mood: "okay",
        tags: ["health", "sleep"],
        offset: 1
    },
    {
        content: "Met up with Sarah for coffee. It was nice to catch up. Anxiety about the upcoming deadline is creeping in though.",
        mood: "good",
        tags: ["social", "anxiety"],
        offset: 2
    },
    {
        content: "Terrible day. Arguments at home and nothing went right at work. Just want this day to end.",
        mood: "bad",
        tags: ["family", "stress"],
        offset: 3
    },
    {
        content: "Amazing workout session! Hit a new PR. Reading a new book 'Atomic Habits' which is inspiring.",
        mood: "great",
        tags: ["fitness", "learning"],
        offset: 4
    },
    {
        content: "Quiet Sunday. Meal prepped for the week. Feeling prepared and calm.",
        mood: "good",
        tags: ["productivity", "planning"],
        offset: 5
    },
    {
        content: "Standard work day. Nothing special. Just grinding through the backlog.",
        mood: "okay",
        tags: ["work"],
        offset: 6
    }
];

const SAMPLE_GOALS = [
    {
        title: "Morning Run",
        description: "Run 5km every morning",
        target_value: 5,
        current_value: 3,
        frequency: "weekly",
        category_id: null,
        status: "active",
        streak: 3
    },
    {
        title: "Read 30 mins",
        description: "Read before bed",
        target_value: 7,
        current_value: 5,
        frequency: "weekly",
        status: "active",
        streak: 12
    },
    {
        title: "Code Side Project",
        description: "Work on LifeOS",
        target_value: 10,
        current_value: 10,
        frequency: "weekly",
        status: "completed",
        streak: 5
    }
];

async function seed() {
    console.log(`Seeding data for user: ${USER_ID}...`);

    // 0. Cleanup
    console.log('Cleaning up existing data...');
    await supabase.from('entries').delete().eq('user_id', USER_ID);
    await supabase.from('goals').delete().eq('user_id', USER_ID);

    // 1. Insert Entries
    console.log('Inserting entries...');
    const entriesDeps = SAMPLE_ENTRIES.map(e => {
        const date = new Date();
        date.setDate(date.getDate() - e.offset);
        return {
            user_id: USER_ID,
            content: e.content,
            mood: e.mood,
            tags: e.tags,
            entry_date: date.toISOString(), // ISO timestamp
            created_at: date.toISOString()
        };
    });

    const { error: entriesError } = await supabase.from('entries').insert(entriesDeps);
    if (entriesError) console.error('Error seeding entries:', entriesError);
    else console.log(`✓ Inserted ${entriesDeps.length} entries`);

    // 2. Insert Goals
    console.log('Inserting goals...');
    const goalsData = SAMPLE_GOALS.map(g => ({
        user_id: USER_ID,
        ...g
    }));

    const { error: goalsError } = await supabase.from('goals').insert(goalsData);
    if (goalsError) console.error('Error seeding goals:', goalsError);
    else console.log(`✓ Inserted ${goalsData.length} goals`);

    console.log('Seeding complete!');
}

seed();
