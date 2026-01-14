-- Create dedicated tables for Decision stage
-- Subsections: Full Analysis, Risks, Verdict

-- Decision Summary (overall verdict and confidence)
CREATE TABLE IF NOT EXISTS public.decision_summary (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('build', 'pivot', 'kill')),
  confidence_score INT CHECK (confidence_score >= 0 AND confidence_score <= 100),
  verdict_explanation TEXT NOT NULL,
  recommended_next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Analysis
CREATE TABLE IF NOT EXISTS public.decision_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  risk_category TEXT NOT NULL CHECK (risk_category IN ('market', 'technical', 'financial', 'team', 'competition', 'regulatory', 'other')),
  risk_title TEXT NOT NULL,
  risk_description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  mitigation_strategy TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
CREATE TABLE IF NOT EXISTS public.decision_swot (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  strengths JSONB DEFAULT '[]', -- Array of strings
  weaknesses JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  threats JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key Assumptions to Validate
CREATE TABLE IF NOT EXISTS public.decision_assumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  assumption TEXT NOT NULL,
  validation_method TEXT, -- How to validate this assumption
  status TEXT DEFAULT 'not_validated' CHECK (status IN ('not_validated', 'validating', 'validated', 'invalidated')),
  evidence TEXT, -- Evidence supporting or refuting
  is_critical BOOLEAN DEFAULT false,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.decision_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_swot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_assumptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decision_summary
CREATE POLICY "Users can view own decision summary" ON public.decision_summary
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_summary.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own decision summary" ON public.decision_summary
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_summary.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own decision summary" ON public.decision_summary
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_summary.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for decision_risks
CREATE POLICY "Users can view own risks" ON public.decision_risks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_risks.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own risks" ON public.decision_risks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_risks.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own risks" ON public.decision_risks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_risks.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own risks" ON public.decision_risks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_risks.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for decision_swot
CREATE POLICY "Users can view own swot" ON public.decision_swot
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_swot.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own swot" ON public.decision_swot
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_swot.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own swot" ON public.decision_swot
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_swot.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for decision_assumptions
CREATE POLICY "Users can view own assumptions" ON public.decision_assumptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_assumptions.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own assumptions" ON public.decision_assumptions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_assumptions.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own assumptions" ON public.decision_assumptions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_assumptions.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own assumptions" ON public.decision_assumptions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = decision_assumptions.startup_id AND startups.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_decision_risks_startup ON public.decision_risks(startup_id);
CREATE INDEX IF NOT EXISTS idx_decision_assumptions_startup ON public.decision_assumptions(startup_id);
