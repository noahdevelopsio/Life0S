-- Opik Metrics Tables for LifeOS
-- Run this in your Supabase SQL Editor

-- AI Evaluations table (stores quality scores for each AI response)
CREATE TABLE IF NOT EXISTS ai_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trace_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    operation TEXT NOT NULL, -- 'ai-chat', 'entry-summarization', etc.
    
    -- Quality scores (0-1)
    supportiveness_score DECIMAL(4,3),
    actionability_score DECIMAL(4,3),
    personalization_score DECIMAL(4,3),
    length_score DECIMAL(4,3),
    overall_score DECIMAL(4,3),
    
    -- Performance metrics
    duration_ms INTEGER,
    token_count INTEGER,
    estimated_cost DECIMAL(10,6),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Feedback table (stores user thumbs up/down)
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trace_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('up', 'down')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_created_at ON ai_evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_user_id ON ai_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created_at ON ai_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON ai_feedback(user_id);

-- Enable RLS
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can see their own data, or all data if they have admin role
CREATE POLICY "Users can view own evaluations" ON ai_evaluations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON ai_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own feedback" ON ai_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON ai_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- View for aggregated metrics (optional, for dashboard)
CREATE OR REPLACE VIEW opik_metrics_summary AS
SELECT 
    COUNT(*) as total_evaluations,
    AVG(supportiveness_score) as avg_supportiveness,
    AVG(actionability_score) as avg_actionability,
    AVG(personalization_score) as avg_personalization,
    AVG(length_score) as avg_length,
    AVG(overall_score) as avg_overall,
    AVG(duration_ms) as avg_duration,
    AVG(token_count) as avg_tokens,
    SUM(estimated_cost) as total_cost,
    (SELECT COUNT(*) FROM ai_feedback WHERE feedback_type = 'up') as thumbs_up,
    (SELECT COUNT(*) FROM ai_feedback WHERE feedback_type = 'down') as thumbs_down
FROM ai_evaluations
WHERE created_at > NOW() - INTERVAL '30 days';
