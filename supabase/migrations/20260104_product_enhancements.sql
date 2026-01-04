-- Migration: Product Details Enhancement
-- Created: 2026-01-04
-- Description: Adds columns for stock, ratings, variants, and creator configuration. Creates reviews and favorites tables.

-- Step 1: Add new columns to artworks table
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS design_style TEXT,
ADD COLUMN IF NOT EXISTS delivery_info TEXT,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS allow_purchase BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_lease BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Step 2: Create artwork_reviews table
CREATE TABLE IF NOT EXISTS artwork_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create artwork_favorites table
CREATE TABLE IF NOT EXISTS artwork_favorites (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_artwork_id ON artwork_reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_favorites_artwork_id ON artwork_favorites(artwork_id);

-- Step 5: Enable RLS
ALTER TABLE artwork_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_favorites ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" 
    ON artwork_reviews FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create reviews" 
    ON artwork_reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
    ON artwork_reviews FOR UPDATE 
    USING (auth.uid() = user_id);

-- Step 7: RLS Policies for favorites
CREATE POLICY "Users can view their own favorites" 
    ON artwork_favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create/delete their own favorites" 
    ON artwork_favorites FOR ALL 
    USING (auth.uid() = user_id);

-- Step 8: Function to update review stats on artworks
CREATE OR REPLACE FUNCTION update_artwork_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE artworks
        SET 
            avg_rating = (SELECT AVG(rating) FROM artwork_reviews WHERE artwork_id = NEW.artwork_id),
            total_reviews = (SELECT COUNT(*) FROM artwork_reviews WHERE artwork_id = NEW.artwork_id)
        WHERE id = NEW.artwork_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE artworks
        SET 
            avg_rating = COALESCE((SELECT AVG(rating) FROM artwork_reviews WHERE artwork_id = OLD.artwork_id), 0),
            total_reviews = (SELECT COUNT(*) FROM artwork_reviews WHERE artwork_id = OLD.artwork_id)
        WHERE id = OLD.artwork_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_artwork_stats
AFTER INSERT OR UPDATE OR DELETE ON artwork_reviews
FOR EACH ROW EXECUTE FUNCTION update_artwork_review_stats();
