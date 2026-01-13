-- Fix for missing 'sources' column if table was created before the column was added to the migration script
ALTER TABLE public.competitor_analyses ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]';
