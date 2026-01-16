-- Migration: ideY Standard v1 Evaluation Schema
-- Run this in Supabase SQL Editor

-- Add new columns to idea_check_evaluations table
ALTER TABLE idea_check_evaluations
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS target_customer_clarity INTEGER,
ADD COLUMN IF NOT EXISTS competitive_differentiation INTEGER,
ADD COLUMN IF NOT EXISTS execution_complexity INTEGER,
ADD COLUMN IF NOT EXISTS traction_validation INTEGER,
ADD COLUMN IF NOT EXISTS risk_profile INTEGER,
ADD COLUMN IF NOT EXISTS score_details JSONB,
ADD COLUMN IF NOT EXISTS total_score INTEGER,
ADD COLUMN IF NOT EXISTS verdict_rationale TEXT,
ADD COLUMN IF NOT EXISTS key_strengths TEXT[],
ADD COLUMN IF NOT EXISTS key_risks TEXT[],
ADD COLUMN IF NOT EXISTS executive_summary TEXT;

-- Create index for faster queries on version
CREATE INDEX IF NOT EXISTS idx_idea_check_evaluations_version 
ON idea_check_evaluations(version);

-- Comment for documentation
COMMENT ON COLUMN idea_check_evaluations.version IS 'Evaluation framework version (v1 = ideY Standard)';
COMMENT ON COLUMN idea_check_evaluations.total_score IS 'Weighted average score 0-100';
COMMENT ON COLUMN idea_check_evaluations.verdict IS 'BUILD, PIVOT, or KILL';
