-- ideY Free vs Pro: User Plans Migration
-- Adds plan column to profiles table

-- Add plan column (default: free)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT 
  CHECK (plan IN ('free', 'pro')) DEFAULT 'free';

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- Table to track evaluation runs per project (for limiting free users)
CREATE TABLE IF NOT EXISTS evaluation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL DEFAULT 1,
  evaluation_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(startup_id, run_number)
);

CREATE INDEX IF NOT EXISTS idx_evaluation_runs_startup ON evaluation_runs(startup_id);
