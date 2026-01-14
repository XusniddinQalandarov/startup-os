-- Fix tasks skill_tag to include 'design'
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_skill_tag_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_skill_tag_check 
  CHECK (skill_tag IN ('frontend', 'backend', 'ai', 'business', 'design'));
