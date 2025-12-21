-- Add category column to leasable_paintings
ALTER TABLE public.leasable_paintings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Update existing records to have a default category if null
UPDATE public.leasable_paintings SET category = 'General' WHERE category IS NULL;
