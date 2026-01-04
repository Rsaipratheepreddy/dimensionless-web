-- Clean Installation: Run this in Supabase SQL Editor
-- This creates the new schema without migrating old data

-- ============================================
-- PART 1: Create Unified Artworks System
-- ============================================

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  about TEXT,
  
  -- Artist Info
  artist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  artist_name TEXT,
  
  -- Pricing & Availability
  purchase_price DECIMAL(10,2),
  lease_monthly_rate DECIMAL(10,2),
  lease_security_deposit DECIMAL(10,2),
  
  -- Artwork Details
  medium TEXT,
  dimensions TEXT,
  year_created INTEGER,
  
  -- Status & Visibility
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold', 'leased', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Search & Discovery
  tags TEXT[],
  category TEXT
);

-- Create artwork_images table
CREATE TABLE IF NOT EXISTS artwork_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_images_primary ON artwork_images(artwork_id, is_primary);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_artworks_updated_at ON artworks;
CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artworks
DROP POLICY IF EXISTS "Public can view published artworks" ON artworks;
CREATE POLICY "Public can view published artworks"
  ON artworks FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Creators can view own artworks" ON artworks;
CREATE POLICY "Creators can view own artworks"
  ON artworks FOR SELECT
  USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Creators can create artworks" ON artworks;
CREATE POLICY "Creators can create artworks"
  ON artworks FOR INSERT
  WITH CHECK (
    auth.uid() = artist_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('creator', 'admin')
    )
  );

DROP POLICY IF EXISTS "Creators can update own artworks" ON artworks;
CREATE POLICY "Creators can update own artworks"
  ON artworks FOR UPDATE
  USING (
    auth.uid() = artist_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('creator', 'admin')
    )
  );

DROP POLICY IF EXISTS "Creators can delete own artworks" ON artworks;
CREATE POLICY "Creators can delete own artworks"
  ON artworks FOR DELETE
  USING (
    auth.uid() = artist_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('creator', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage all artworks" ON artworks;
CREATE POLICY "Admins can manage all artworks"
  ON artworks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for artwork_images
DROP POLICY IF EXISTS "Public can view published artwork images" ON artwork_images;
CREATE POLICY "Public can view published artwork images"
  ON artwork_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artworks 
      WHERE id = artwork_images.artwork_id 
      AND status = 'published'
    )
  );

DROP POLICY IF EXISTS "Creators can view own artwork images" ON artwork_images;
CREATE POLICY "Creators can view own artwork images"
  ON artwork_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artworks 
      WHERE id = artwork_images.artwork_id 
      AND artist_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Creators can manage own artwork images" ON artwork_images;
CREATE POLICY "Creators can manage own artwork images"
  ON artwork_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM artworks 
      WHERE id = artwork_images.artwork_id 
      AND artist_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('creator', 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage all artwork images" ON artwork_images;
CREATE POLICY "Admins can manage all artwork images"
  ON artwork_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

GRANT ALL ON artworks TO authenticated;
GRANT ALL ON artwork_images TO authenticated;
GRANT SELECT ON artworks TO anon;
GRANT SELECT ON artwork_images TO anon;

-- ============================================
-- PART 2: Enhanced User Roles & Permissions
-- ============================================

-- Drop existing role column
ALTER TABLE profiles DROP COLUMN IF EXISTS role CASCADE;

-- Create user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employee', 'creator', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role and creator columns
ALTER TABLE profiles 
  ADD COLUMN role user_role DEFAULT 'member' NOT NULL,
  ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS shop_description TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 15.00;

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- Seed permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  ('admin', '*', '*'),
  ('employee', 'bookings', 'read'),
  ('employee', 'bookings', 'update'),
  ('employee', 'tattoos', 'read'),
  ('employee', 'piercings', 'read'),
  ('employee', 'events', 'read'),
  ('employee', 'users', 'read'),
  ('employee', 'classes', 'read'),
  ('creator', 'artworks', 'create'),
  ('creator', 'artworks', 'read'),
  ('creator', 'artworks', 'update'),
  ('creator', 'artworks', 'delete'),
  ('creator', 'shop', 'manage'),
  ('creator', 'analytics', 'read'),
  ('creator', 'profile', 'update'),
  ('member', 'artworks', 'read'),
  ('member', 'purchases', 'create'),
  ('member', 'leases', 'create'),
  ('member', 'bookings', 'create'),
  ('member', 'bookings', 'read'),
  ('member', 'profile', 'update'),
  ('member', 'events', 'read'),
  ('member', 'classes', 'read')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Create permission check function
CREATE OR REPLACE FUNCTION has_permission(
  user_id UUID,
  check_resource TEXT,
  check_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
  has_perm BOOLEAN;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  
  SELECT EXISTS (
    SELECT 1 FROM role_permissions
    WHERE role = user_role
    AND (
      (resource = '*' AND action = '*') OR
      (resource = check_resource AND action = '*') OR
      (resource = '*' AND action = check_action) OR
      (resource = check_resource AND action = check_action)
    )
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS for role_permissions
DROP POLICY IF EXISTS "Anyone can read role permissions" ON role_permissions;
CREATE POLICY "Anyone can read role permissions"
  ON role_permissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;
CREATE POLICY "Admins can manage role permissions"
  ON role_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

GRANT ALL ON role_permissions TO authenticated;
GRANT SELECT ON role_permissions TO anon;

-- ============================================
-- DONE! Schema is ready to use
-- ============================================

-- You can now optionally drop old tables if you don't need them:
-- DROP TABLE IF EXISTS paintings CASCADE;
-- DROP TABLE IF EXISTS leasable_paintings CASCADE;
