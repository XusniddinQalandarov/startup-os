-- Create dedicated tables for Build Plan stage
-- These tables are interconnected: MVP → Tech Stack → Roadmap → Tasks

-- Build Plan Summary (overall metrics and status)
CREATE TABLE IF NOT EXISTS public.build_plan_summary (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  total_weeks INT,
  total_tasks INT,
  must_have_features INT,
  complexity_level TEXT CHECK (complexity_level IN ('simple', 'moderate', 'complex')),
  complexity_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MVP Features (what to build)
CREATE TABLE IF NOT EXISTS public.build_plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('must_have', 'later', 'not_now')),
  rationale TEXT, -- Why this priority
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tech Stack Recommendations (how to build)
CREATE TABLE IF NOT EXISTS public.build_plan_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- Frontend, Backend, Database, etc.
  recommendation TEXT NOT NULL,
  reason TEXT NOT NULL,
  alternatives TEXT, -- Other options considered
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roadmap Phases (when to build)
CREATE TABLE IF NOT EXISTS public.build_plan_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  phase_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_weeks INT NOT NULL,
  goals JSONB DEFAULT '[]', -- Array of milestone goals
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (granular work items)
CREATE TABLE IF NOT EXISTS public.build_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  phase_id UUID REFERENCES public.build_plan_roadmap(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimate_hours INT DEFAULT 4,
  skill_tag TEXT CHECK (skill_tag IN ('frontend', 'backend', 'ai', 'business', 'design')),
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'blocked', 'done')),
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.build_plan_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_plan_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_plan_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_plan_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for build_plan_summary
CREATE POLICY "Users can view own build plan summary" ON public.build_plan_summary
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_summary.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own build plan summary" ON public.build_plan_summary
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_summary.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own build plan summary" ON public.build_plan_summary
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_summary.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for build_plan_features
CREATE POLICY "Users can view own features" ON public.build_plan_features
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_features.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own features" ON public.build_plan_features
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_features.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own features" ON public.build_plan_features
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_features.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for build_plan_tech_stack
CREATE POLICY "Users can view own tech stack" ON public.build_plan_tech_stack
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tech_stack.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own tech stack" ON public.build_plan_tech_stack
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tech_stack.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own tech stack" ON public.build_plan_tech_stack
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tech_stack.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for build_plan_roadmap
CREATE POLICY "Users can view own roadmap" ON public.build_plan_roadmap
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_roadmap.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own roadmap" ON public.build_plan_roadmap
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_roadmap.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own roadmap" ON public.build_plan_roadmap
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_roadmap.startup_id AND startups.user_id = auth.uid())
  );

-- RLS Policies for build_plan_tasks
CREATE POLICY "Users can view own build tasks" ON public.build_plan_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tasks.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own build tasks" ON public.build_plan_tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tasks.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can update own build tasks" ON public.build_plan_tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tasks.startup_id AND startups.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own build tasks" ON public.build_plan_tasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = build_plan_tasks.startup_id AND startups.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_build_plan_features_startup ON public.build_plan_features(startup_id);
CREATE INDEX IF NOT EXISTS idx_build_plan_tech_startup ON public.build_plan_tech_stack(startup_id);
CREATE INDEX IF NOT EXISTS idx_build_plan_roadmap_startup ON public.build_plan_roadmap(startup_id);
CREATE INDEX IF NOT EXISTS idx_build_plan_tasks_startup ON public.build_plan_tasks(startup_id);
CREATE INDEX IF NOT EXISTS idx_build_plan_tasks_phase ON public.build_plan_tasks(phase_id);
