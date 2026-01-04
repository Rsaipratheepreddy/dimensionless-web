-- Migration: User Interests & Preferences System
-- Created: 2026-01-04
-- Description: Adds user interests, preferences, and onboarding tracking to profiles

-- Step 1: Add interest-related columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interest_details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

-- Step 2: Create interest_categories reference table
CREATE TABLE IF NOT EXISTS interest_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  subcategories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interest_categories_name ON interest_categories(name);
CREATE INDEX IF NOT EXISTS idx_interest_categories_active ON interest_categories(is_active);

-- Step 3: Seed interest categories
INSERT INTO interest_categories (name, display_name, description, icon, subcategories, display_order) VALUES
  ('art', 'Art & Paintings', 'Fine art, paintings, and visual arts', '🎨', 
   ARRAY['abstract', 'portrait', 'landscape', 'modern', 'classical', 'digital'], 1),
  ('tattoos', 'Tattoos', 'Tattoo designs and body art', '🖊️', 
   ARRAY['traditional', 'minimalist', 'geometric', 'watercolor', 'tribal', 'realistic'], 2),
  ('piercings', 'Piercings', 'Body piercings and jewelry', '💎', 
   ARRAY['ear', 'nose', 'facial', 'body'], 3),
  ('coding', 'Coding & Tech', 'Programming and technology', '💻', 
   ARRAY['web_dev', 'mobile_dev', 'ai_ml', 'blockchain', 'devops'], 4),
  ('office_makeover', 'Office Makeover', 'Workspace design and organization', '🏢', 
   ARRAY['interior_design', 'furniture', 'decor', 'plants', 'lighting'], 5),
  ('classes', 'Classes & Courses', 'Educational content and workshops', '📚', 
   ARRAY['art_classes', 'coding_bootcamp', 'design', 'business'], 6),
  ('events', 'Events', 'Exhibitions, meetups, and gatherings', '🎉', 
   ARRAY['exhibitions', 'workshops', 'networking', 'conferences'], 7)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Enable RLS on interest_categories
ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies for interest_categories

DROP POLICY IF EXISTS "Anyone can view active categories" ON interest_categories;
CREATE POLICY "Anyone can view active categories"
  ON interest_categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON interest_categories;
CREATE POLICY "Admins can manage categories"
  ON interest_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 6: Grant permissions
GRANT SELECT ON interest_categories TO authenticated, anon;

-- Step 7: Create helper function to get recommended content based on interests
CREATE OR REPLACE FUNCTION get_personalized_content(p_user_id UUID)
RETURNS TABLE (
  content_type TEXT,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(interests) as content_type,
    10 as relevance_score
  FROM profiles
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_personalized_content(UUID) TO authenticated;

-- Example interest_details JSONB structure:
-- {
--   "art": {
--     "subcategories": ["abstract", "modern"],
--     "preference_level": 8
--   },
--   "tattoos": {
--     "subcategories": ["minimalist", "geometric"],
--     "preference_level": 9
--   }
-- }
