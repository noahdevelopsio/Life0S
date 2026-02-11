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

const USER_ID = process.argv[2] || ''; // Default to specific user if not provided

if (!USER_ID) {
    console.error('Please provide a User ID as an argument');
    process.exit(1);
}

// Generate 30 days of varied entries
const SAMPLE_ENTRIES = Array.from({ length: 30 }, (_, i) => {
    const moods = ['great', 'good', 'okay', 'bad', 'terrible'];
    const tags = [
        ['work', 'productivity'],
        ['health', 'fitness'],
        ['social', 'family'],
        ['stress', 'work'],
        ['learning', 'growth'],
        ['relax', 'hobbies']
    ];

    // Create patterns: Weekends are better, Monday is stressful
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.getDay();

    let mood = moods[Math.floor(Math.random() * 3)]; // Default good/great/okay
    if (day === 1) mood = Math.random() > 0.5 ? 'bad' : 'okay'; // Mondays tough
    if (day === 0 || day === 6) mood = 'great'; // Weekends great

    return {
        content: `Journal entry for day ${i}. Today was a ${mood} day. I focused on ${tags[i % tags.length].join(' and ')}. ` +
            (mood === 'great' ? "Felt really energetic and accomplished." :
                mood === 'bad' ? "Struggled a bit with motivation." : "Just a regular day."),
        mood,
        tags: tags[i % tags.length],
        offset: i
    };
});

const SAMPLE_GOALS = [
    {
        title: "Morning Run",
        description: "Run 5km every morning",
        target_value: 5,
        current_value: 3,
        frequency: "weekly",
        category_id: null,
        status: "active",
        streak: 15
    },
    {
        title: "Read 30 mins",
        description: "Read before bed",
        target_value: 7,
        current_value: 6,
        frequency: "weekly",
        status: "active",
        streak: 4
    },
    {
        title: "Deep Work",
        description: "2 hours of focused work",
        target_value: 10,
        current_value: 8,
        frequency: "weekly",
        status: "active",
        streak: 8
    },
    {
        title: "Meditation",
        description: "10 mins mindfulness",
        target_value: 7,
        current_value: 2,
        frequency: "weekly",
        status: "active",
        streak: 2
    }
];

async function seed() {
    console.log(`Seeding EXTENDED data for user: ${USER_ID}...`);

    // 0. Cleanup
    console.log('Cleaning up existing data...');
    // Note: Deleting reflections mostly to force regeneration, but keeping them might be useful?
    // Let's clear them so we can test "first reflection" flow again with new data
    await supabase.from('reflections').delete().eq('user_id', USER_ID);
    await supabase.from('entries').delete().eq('user_id', USER_ID);
    await supabase.from('goals').delete().eq('user_id', USER_ID);

    // 1. Insert Entries
    console.log('Inserting 30 days of entries...');
    const entriesDeps = SAMPLE_ENTRIES.map(e => {
        const date = new Date();
        date.setDate(date.getDate() - e.offset);
        return {
            user_id: USER_ID,
            content: e.content,
            mood: e.mood,
            tags: e.tags,
            entry_date: date.toISOString(),
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

    console.log('Seeding complete! You can now test the Reflection generation.');
}

seed();
