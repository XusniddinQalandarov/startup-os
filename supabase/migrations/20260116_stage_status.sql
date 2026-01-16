-- Migration: Add stage_status to startups table
-- Run this in Supabase SQL Editor

-- Add stage_status column to track lock state per stage
ALTER TABLE startups
ADD COLUMN IF NOT EXISTS stage_status JSONB DEFAULT '{
  "idea_check": "draft",
  "market_reality": "draft",
  "build_plan": "draft",
  "launch_plan": "draft",
  "decision": "draft"
}'::jsonb;

-- Create index for faster queries on stage_status
CREATE INDEX IF NOT EXISTS idx_startups_stage_status 
ON startups USING GIN (stage_status);

-- Comment for documentation
COMMENT ON COLUMN startups.stage_status IS 'JSON object tracking lock status per stage: draft, locked, or outdated';
