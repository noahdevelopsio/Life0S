-- Users table (extended from Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  ai_personality TEXT DEFAULT 'supportive', -- 'supportive' | 'direct' | 'warm'
  theme_preference TEXT DEFAULT 'system', -- 'light' | 'dark' | 'system'
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, icon, color, description) VALUES
('Study & Learning', '📚', '#3B82F6', 'Personal growth and learning'),
('Health & Fitness', '💪', '#10B981', 'Physical health and wellness'),
('Financial Health', '💰', '#F59E0B', 'Money management and savings'),
('Personal Growth', '🌱', '#8B5CF6', 'Self-improvement and mindfulness'),
('Social & Community', '🤝', '#EC4899', 'Relationships and social impact');

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL, -- 'daily' | 'weekly' | 'custom'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'paused' | 'completed' | 'archived'
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT, -- 'great' | 'good' | 'okay' | 'bad' | 'terrible'
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[], -- Array of tag strings
  media_urls TEXT[], -- Array of image/file URLs
  ai_summary TEXT, -- AI-generated summary
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goal Logs (tracking progress)
CREATE TABLE goal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  value INTEGER DEFAULT 1,
  note TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  metadata JSONB, -- For storing charts, actions, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reflections (AI-generated weekly/monthly summaries)
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'week' | 'month' | 'quarter' | 'year'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  summary TEXT NOT NULL,
  insights JSONB, -- Array of insight objects
  metrics JSONB, -- Key metrics for the period
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  reminder_time TIME DEFAULT '09:00',
  preferred_categories UUID[], -- Array of category IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_entries_user_date ON entries(user_id, entry_date DESC);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_goal_logs_goal ON goal_logs(goal_id, logged_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_reflections_user_period ON reflections(user_id, period_type, start_date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own entries" ON entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own goal_logs" ON goal_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own messages" ON messages FOR ALL USING (
  auth.uid() = (SELECT user_id FROM conversations WHERE id = conversation_id)
);
CREATE POLICY "Users can CRUD own reflections" ON reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own preferences" ON preferences FOR ALL USING (auth.uid() = user_id);

-- Categories are public (read-only for users)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT TO authenticated USING (true);
