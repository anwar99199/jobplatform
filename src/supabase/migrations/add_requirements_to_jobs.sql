-- Add requirements column to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Add comment
COMMENT ON COLUMN public.jobs.requirements IS 'Job requirements and qualifications';
