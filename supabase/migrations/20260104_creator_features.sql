-- Migration: Creator/Artist Enhanced Profile Fields
-- Created: 2026-01-04
-- Description: Adds specialized fields for creators, gallery management, and pro status

-- Step 1: Add creator-specific columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gallery_name TEXT,
  ADD COLUMN IF NOT EXISTS gallery_description TEXT;

-- Step 2: Create a view or function to check creator eligibility
-- A creator needs 3-5 artworks to be "highlighted"
CREATE OR REPLACE FUNCTION get_creator_artwork_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM artworks WHERE artist_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Update RLS policies for profiles to allow users to update their new fields
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Comment on columns for clarity
COMMENT ON COLUMN profiles.awards IS 'List of artistic awards: [{"title": "...", "year": 2024, "description": "..."}]';
COMMENT ON COLUMN profiles.certifications IS 'List of certifications: [{"title": "...", "issuer": "...", "date": "..."}]';
COMMENT ON COLUMN profiles.is_pro IS 'Eligibility for leasing artworks (membership status)';
