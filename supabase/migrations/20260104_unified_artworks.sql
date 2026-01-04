-- Migration: Unified Artworks System
-- Created: 2026-01-04
-- Description: Merges paintings and leasable_paintings into unified artworks table with multiple image support

-- Step 1: Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  about TEXT, -- Detailed story/background about the artwork
  
  -- Artist Info
  artist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  artist_name TEXT, -- Denormalized for display
  
  -- Pricing & Availability
  purchase_price DECIMAL(10,2), -- NULL if not for sale
  lease_monthly_rate DECIMAL(10,2), -- NULL if not for lease
  lease_security_deposit DECIMAL(10,2),
  
  -- Artwork Details
  medium TEXT, -- Oil, Acrylic, Watercolor, Digital, etc.
  dimensions TEXT, -- e.g., "24x36 inches"
  year_created INTEGER,
  
  -- Status & Visibility
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sold', 'leased', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Search & Discovery
  tags TEXT[], -- Array of tags for categorization
  category TEXT -- Fine Art, Abstract, Portrait, Landscape, etc.
);

-- Step 2: Create artwork_images table for multiple images
CREATE TABLE IF NOT EXISTS artwork_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_images_primary ON artwork_images(artwork_id, is_primary);

-- Step 3: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Enable Row Level Security
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_images ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies for artworks

-- Public can view published artworks
CREATE POLICY "Public can view published artworks"
  ON artworks FOR SELECT
  USING (status = 'published');

-- Creators can view their own artworks (any status)
CREATE POLICY "Creators can view own artworks"
  ON artworks FOR SELECT
  USING (
    auth.uid() = artist_id
  );

-- Creators can create artworks
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

-- Creators can update their own artworks
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

-- Creators can delete their own artworks
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

-- Admins can manage all artworks
CREATE POLICY "Admins can manage all artworks"
  ON artworks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 6: RLS Policies for artwork_images

-- Public can view images of published artworks
CREATE POLICY "Public can view published artwork images"
  ON artwork_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artworks 
      WHERE id = artwork_images.artwork_id 
      AND status = 'published'
    )
  );

-- Creators can view images of their own artworks
CREATE POLICY "Creators can view own artwork images"
  ON artwork_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artworks 
      WHERE id = artwork_images.artwork_id 
      AND artist_id = auth.uid()
    )
  );

-- Creators can manage images of their own artworks
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

-- Admins can manage all artwork images
CREATE POLICY "Admins can manage all artwork images"
  ON artwork_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 7: Grant permissions
GRANT ALL ON artworks TO authenticated;
GRANT ALL ON artwork_images TO authenticated;
GRANT SELECT ON artworks TO anon;
GRANT SELECT ON artwork_images TO anon;
