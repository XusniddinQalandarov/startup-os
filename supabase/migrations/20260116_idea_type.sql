-- Add idea_type column to startups table
ALTER TABLE startups ADD COLUMN idea_type TEXT CHECK (idea_type IN ('B2C', 'B2B', 'B2G', 'Mixed'));

-- Create index for faster filtering/analytics
CREATE INDEX idx_startups_idea_type ON startups(idea_type);
