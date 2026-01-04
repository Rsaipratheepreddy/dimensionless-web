-- Migration: Data Migration from Legacy Tables
-- Created: 2026-01-04
-- Description: Migrates data from paintings and leasable_paintings to artworks

-- Step 1: Backup existing data (create backup tables)
CREATE TABLE IF NOT EXISTS paintings_backup AS SELECT * FROM paintings;
CREATE TABLE IF NOT EXISTS leasable_paintings_backup AS SELECT * FROM leasable_paintings;

-- Step 2: Migrate paintings to artworks
INSERT INTO artworks (
  id,
  title,
  description,
  artist_id,
  artist_name,
  purchase_price,
  status,
  created_at,
  updated_at
)
SELECT 
  id,
  title,
  description,
  artist_id,
  COALESCE(
    (SELECT full_name FROM profiles WHERE id = paintings.artist_id),
    'Unknown Artist'
  ) as artist_name,
  price as purchase_price,
  status,
  created_at,
  updated_at
FROM paintings
WHERE NOT EXISTS (
  SELECT 1 FROM artworks WHERE artworks.id = paintings.id
);

-- Step 3: Migrate painting images to artwork_images
INSERT INTO artwork_images (
  artwork_id,
  image_url,
  is_primary,
  display_order
)
SELECT 
  id as artwork_id,
  image_url,
  true as is_primary,
  0 as display_order
FROM paintings
WHERE image_url IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM artwork_images 
  WHERE artwork_id = paintings.id 
  AND image_url = paintings.image_url
);

-- Step 4: Migrate leasable_paintings to artworks
INSERT INTO artworks (
  id,
  title,
  description,
  artist_name,
  lease_monthly_rate,
  status,
  created_at,
  updated_at
)
SELECT 
  id,
  title,
  description,
  artist_name,
  monthly_rate as lease_monthly_rate,
  CASE WHEN is_available THEN 'published' ELSE 'archived' END as status,
  created_at,
  updated_at
FROM leasable_paintings
WHERE NOT EXISTS (
  SELECT 1 FROM artworks WHERE artworks.id = leasable_paintings.id
);

-- Step 5: Migrate leasable painting images to artwork_images
INSERT INTO artwork_images (
  artwork_id,
  image_url,
  is_primary,
  display_order
)
SELECT 
  id as artwork_id,
  image_url,
  true as is_primary,
  0 as display_order
FROM leasable_paintings
WHERE image_url IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM artwork_images 
  WHERE artwork_id = leasable_paintings.id 
  AND image_url = leasable_paintings.image_url
);

-- Step 6: Update art_purchases to reference artworks
-- Add artwork_id column if it doesn't exist
ALTER TABLE art_purchases 
  ADD COLUMN IF NOT EXISTS artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL;

-- Migrate painting_id to artwork_id
UPDATE art_purchases 
SET artwork_id = painting_id
WHERE artwork_id IS NULL AND painting_id IS NOT NULL;

-- Step 7: Update art_leases to reference artworks
-- Add artwork_id column if it doesn't exist
ALTER TABLE art_leases
  ADD COLUMN IF NOT EXISTS artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL;

-- Migrate painting_id to artwork_id
UPDATE art_leases
SET artwork_id = painting_id
WHERE artwork_id IS NULL AND painting_id IS NOT NULL;

-- Step 8: Verification queries (run these to check migration)
-- Count records
DO $$
DECLARE
  paintings_count INTEGER;
  leasable_count INTEGER;
  artworks_count INTEGER;
  images_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO paintings_count FROM paintings;
  SELECT COUNT(*) INTO leasable_count FROM leasable_paintings;
  SELECT COUNT(*) INTO artworks_count FROM artworks;
  SELECT COUNT(*) INTO images_count FROM artwork_images;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE 'Paintings: %', paintings_count;
  RAISE NOTICE 'Leasable Paintings: %', leasable_count;
  RAISE NOTICE 'Total Artworks: %', artworks_count;
  RAISE NOTICE 'Total Images: %', images_count;
  
  IF artworks_count < (paintings_count + leasable_count) THEN
    RAISE WARNING 'Some records may not have been migrated!';
  END IF;
END $$;

-- Step 9: Drop old columns from art_purchases and art_leases (after verification)
-- UNCOMMENT THESE AFTER VERIFYING MIGRATION IS SUCCESSFUL
-- ALTER TABLE art_purchases DROP COLUMN IF EXISTS painting_id;
-- ALTER TABLE art_leases DROP COLUMN IF EXISTS painting_id;

-- Step 10: Drop legacy tables (ONLY after complete verification)
-- UNCOMMENT THESE AFTER COMPLETE VERIFICATION
-- DROP TABLE IF EXISTS paintings CASCADE;
-- DROP TABLE IF EXISTS leasable_paintings CASCADE;

-- Keep backup tables for safety
-- They can be dropped manually later after confirming everything works
