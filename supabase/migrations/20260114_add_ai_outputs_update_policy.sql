-- Add missing UPDATE policy for ai_outputs to enable UPSERT operations
CREATE POLICY "Users can update own ai_outputs" ON ai_outputs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM startups WHERE startups.id = ai_outputs.startup_id AND startups.user_id = auth.uid())
  );
