-- Create dedicated tables for Market Reality stage
-- Similar to Idea Check, this provides faster queries than JSONB

-- Market Reality Analysis (differentiation, value prop, unfair advantage)
CREATE TABLE IF NOT EXISTS public.market_reality_analysis (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  -- Differentiation content
  value_proposition TEXT,
  unfair_advantage TEXT,
  positioning_statement TEXT,
  -- AI-generated insights
  market_difficulty TEXT CHECK (market_difficulty IN ('low', 'moderate', 'high')),
  market_difficulty_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.market_reality_analysis ENABLE ROW LEVEL SECURITY;

-- Policies for market_reality_analysis
CREATE POLICY "Users can view own market analysis" ON public.market_reality_analysis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = market_reality_analysis.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own market analysis" ON public.market_reality_analysis
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = market_reality_analysis.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can update own market analysis" ON public.market_reality_analysis
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = market_reality_analysis.startup_id AND startups.user_id = auth.uid())
  );

-- Add sources column to competitor_analyses if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competitor_analyses' AND column_name = 'sources'
  ) THEN
    ALTER TABLE public.competitor_analyses ADD COLUMN sources JSONB DEFAULT '[]';
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_market_reality_analysis_startup_id 
ON public.market_reality_analysis(startup_id);
