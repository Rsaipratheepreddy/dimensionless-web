-- Add 'pending' to artworks status check constraint
ALTER TABLE artworks DROP CONSTRAINT IF EXISTS artworks_status_check;
ALTER TABLE artworks ADD CONSTRAINT artworks_status_check 
CHECK (status IN ('draft', 'pending', 'published', 'sold', 'leased', 'archived'));

-- Also check if paintings table needs it (legacy)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paintings') THEN
        ALTER TABLE paintings DROP CONSTRAINT IF EXISTS paintings_status_check;
        ALTER TABLE paintings ADD CONSTRAINT paintings_status_check 
        CHECK (status IN ('available', 'sold', 'hidden', 'pending'));
    END IF;
END $$;
