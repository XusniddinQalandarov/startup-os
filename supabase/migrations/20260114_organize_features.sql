-- Migration to organize AI outputs into dedicated tables for better performance and structure

-- 1. Create table for Competitor Analysis
CREATE TABLE IF NOT EXISTS public.competitor_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    market_overview TEXT,
    competitors JSONB NOT NULL DEFAULT '[]', -- Array of competitor objects
    opportunities TEXT[],
    threats TEXT[],
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(startup_id)
);

-- 2. Create table for Project Analysis (Market, Business Model, etc.)
CREATE TABLE IF NOT EXISTS public.project_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    problem_statement JSONB, -- { title, content }
    target_audience JSONB,
    value_proposition JSONB,
    tam JSONB,
    sam JSONB,
    som JSONB,
    business_model JSONB,
    key_metrics JSONB,
    unfair_advantage JSONB,
    channels JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(startup_id)
);

-- 3. Create RLS Policies
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own competitor analysis" 
    ON public.competitor_analyses FOR SELECT 
    USING (auth.uid() IN (SELECT user_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Users can insert/update their own competitor analysis" 
    ON public.competitor_analyses FOR ALL 
    USING (auth.uid() IN (SELECT user_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Users can view their own project analysis" 
    ON public.project_analyses FOR SELECT 
    USING (auth.uid() IN (SELECT user_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Users can insert/update their own project analysis" 
    ON public.project_analyses FOR ALL 
    USING (auth.uid() IN (SELECT user_id FROM public.startups WHERE id = startup_id));

-- 4. (Optional) Migrate existing data from ai_outputs
-- INSERT INTO public.competitor_analyses (startup_id, market_overview, competitors, opportunities, threats)
-- SELECT startup_id, output_data->>'marketOverview', output_data->'competitors', ...
-- FROM public.ai_outputs WHERE output_type = 'competitors';
