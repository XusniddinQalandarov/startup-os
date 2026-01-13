-- Startups (Projects) table
CREATE TABLE IF NOT EXISTS startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  idea TEXT NOT NULL,
  target_users TEXT,
  business_type TEXT CHECK (business_type IN ('b2b', 'b2c', 'both')),
  geography TEXT,
  founder_type TEXT CHECK (founder_type IN ('technical', 'non-technical', 'mixed')),
  status TEXT DEFAULT 'evaluating' CHECK (status IN ('evaluating', 'evaluated', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Outputs (versioned JSON storage)
CREATE TABLE IF NOT EXISTS ai_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  output_type TEXT NOT NULL CHECK (output_type IN ('evaluation', 'questions', 'mvp', 'roadmap', 'tasks', 'tech_stack', 'costs')),
  output_data JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'blocked', 'done')),
  estimate_hours INT DEFAULT 0,
  skill_tag TEXT CHECK (skill_tag IN ('frontend', 'backend', 'ai', 'business')),
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for startups
CREATE POLICY "Users can view own startups" ON startups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own startups" ON startups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own startups" ON startups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own startups" ON startups
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for ai_outputs (access through startup ownership)
CREATE POLICY "Users can view own ai_outputs" ON ai_outputs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = ai_outputs.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can create own ai_outputs" ON ai_outputs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = ai_outputs.startup_id AND startups.user_id = auth.uid())
  );

-- Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = tasks.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = tasks.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = tasks.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = tasks.startup_id AND startups.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_startup_id ON ai_outputs(startup_id);
CREATE INDEX IF NOT EXISTS idx_tasks_startup_id ON tasks(startup_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
