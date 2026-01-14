-- Create dedicated tables for Launch Plan stage
-- Subsections: Go-to-Market, Costs, Success Metrics

-- Launch Plan Summary (overall metrics and readiness)
CREATE TABLE IF NOT EXISTS public.launch_plan_summary (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  launch_readiness TEXT CHECK (launch_readiness IN ('not_started', 'in_progress', 'almost_ready', 'launch_ready')),
  estimated_launch_date DATE,
  total_monthly_cost DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Go-to-Market Strategy
CREATE TABLE IF NOT EXISTS public.launch_plan_gtm (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  channels TEXT NOT NULL, -- Distribution/marketing channels
  target_segment TEXT, -- Initial target segment
  launch_strategy TEXT, -- How to launch (soft launch, beta, public, etc.)
  first_100_users TEXT, -- Strategy to get first 100 users
  partnerships TEXT, -- Potential partnerships
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost Estimates
CREATE TABLE IF NOT EXISTS public.launch_plan_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Infrastructure', 'Tools', 'AI', 'Marketing', 'Other')),
  item TEXT NOT NULL,
  monthly_cost DECIMAL(10, 2) NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  notes TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Success Metrics
CREATE TABLE IF NOT EXISTS public.launch_plan_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  target_value TEXT NOT NULL,
  timeframe TEXT NOT NULL, -- e.g., "30 days", "Q1", "Year 1"
  metric_type TEXT CHECK (metric_type IN ('growth', 'revenue', 'engagement', 'retention', 'other')),
  is_north_star BOOLEAN DEFAULT false,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.launch_plan_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_plan_gtm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_plan_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_plan_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for launch_plan_summary
CREATE POLICY "Users can view own launch summary" ON public.launch_plan_summary
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_summary.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own launch summary" ON public.launch_plan_summary
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_summary.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own launch summary" ON public.launch_plan_summary
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_summary.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for launch_plan_gtm
CREATE POLICY "Users can view own gtm" ON public.launch_plan_gtm
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_gtm.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own gtm" ON public.launch_plan_gtm
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_gtm.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own gtm" ON public.launch_plan_gtm
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_gtm.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for launch_plan_costs
CREATE POLICY "Users can view own costs" ON public.launch_plan_costs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_costs.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own costs" ON public.launch_plan_costs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_costs.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own costs" ON public.launch_plan_costs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_costs.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own costs" ON public.launch_plan_costs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_costs.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for launch_plan_metrics
CREATE POLICY "Users can view own metrics" ON public.launch_plan_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_metrics.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own metrics" ON public.launch_plan_metrics
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_metrics.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own metrics" ON public.launch_plan_metrics
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_metrics.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own metrics" ON public.launch_plan_metrics
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = launch_plan_metrics.startup_id AND startups.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_launch_plan_costs_startup ON public.launch_plan_costs(startup_id);
CREATE INDEX IF NOT EXISTS idx_launch_plan_metrics_startup ON public.launch_plan_metrics(startup_id);
