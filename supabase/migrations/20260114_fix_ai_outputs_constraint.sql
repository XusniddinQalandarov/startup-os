-- Remove duplicates keeping the latest one (by id or created_at usually, but assuming id is enough if random or created_at)
-- Actually let's trust created_at if available or just arbitrary logic to keep one
DELETE FROM public.ai_outputs a USING public.ai_outputs b
WHERE a.created_at < b.created_at
AND a.startup_id = b.startup_id 
AND a.output_type = b.output_type;

-- Add unique constraint to ai_outputs to allow UPSERT operations
ALTER TABLE public.ai_outputs 
ADD CONSTRAINT ai_outputs_startup_id_output_type_key UNIQUE (startup_id, output_type);
