-- Add reaction_type to likes
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'like';
