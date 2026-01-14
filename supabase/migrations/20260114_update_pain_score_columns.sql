-- Migration to update idea_check_evaluations table for new Pain Score methodology
-- Renaming columns to match the new evaluation criteria

-- Step 1: Add new columns
ALTER TABLE public.idea_check_evaluations
ADD COLUMN IF NOT EXISTS problem_severity INTEGER,
ADD COLUMN IF NOT EXISTS market_opportunity INTEGER,
ADD COLUMN IF NOT EXISTS differentiation INTEGER;

-- Step 2: Migrate data from old columns to new ones
UPDATE public.idea_check_evaluations SET
  problem_severity = COALESCE(market_potential, 50),
  market_opportunity = COALESCE(market_potential, 50),
  differentiation = COALESCE(uniqueness, 50)
WHERE problem_severity IS NULL;

-- Step 3: Drop old columns (optional - uncomment if you want to remove them)
-- ALTER TABLE public.idea_check_evaluations DROP COLUMN IF EXISTS market_potential;
-- ALTER TABLE public.idea_check_evaluations DROP COLUMN IF EXISTS competition;
-- ALTER TABLE public.idea_check_evaluations DROP COLUMN IF EXISTS uniqueness;

-- Note: feasibility column remains the same
