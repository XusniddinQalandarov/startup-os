-- Create dedicated tables for Idea Check stage (faster querying, better structure)

-- Idea Check Evaluations (scores and verdict)
CREATE TABLE IF NOT EXISTS idea_check_evaluations (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  market_potential INT NOT NULL CHECK (market_potential >= 0 AND market_potential <= 100),
  feasibility INT NOT NULL CHECK (feasibility >= 0 AND feasibility <= 100),
  competition INT NOT NULL CHECK (competition >= 0 AND competition <= 100),
  uniqueness INT NOT NULL CHECK (uniqueness >= 0 AND uniqueness <= 100),
  verdict TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Questions (individual rows for better query performance)
CREATE TABLE IF NOT EXISTS idea_check_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('ask', 'avoid')),
  insight TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE idea_check_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_check_questions ENABLE ROW LEVEL SECURITY;

-- Policies for idea_check_evaluations
CREATE POLICY "Users can view own evaluations" ON idea_check_evaluations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = idea_check_evaluations.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own evaluations" ON idea_check_evaluations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = idea_check_evaluations.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can update own evaluations" ON idea_check_evaluations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = idea_check_evaluations.startup_id AND startups.user_id = auth.uid())
  );

-- Policies for idea_check_questions
CREATE POLICY "Users can view own questions" ON idea_check_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = idea_check_questions.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own questions" ON idea_check_questions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = idea_check_questions.startup_id AND startups.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own questions" ON idea_check_questions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = idea_check_questions.startup_id AND startups.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_check_questions_startup_id ON idea_check_questions(startup_id);
CREATE INDEX IF NOT EXISTS idx_idea_check_questions_flag_type ON idea_check_questions(startup_id, flag_type);
