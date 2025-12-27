-- Dynamic Categories System

-- Create categories table for all content types
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'tattoo', 'art', 'leasing', 'general'
  description TEXT,
  color VARCHAR(7), -- Hex color for UI chips
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Update tattoo_designs to use category_id instead of category string
ALTER TABLE tattoo_designs 
  DROP COLUMN IF EXISTS category,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Update paintings table to use category_id
ALTER TABLE paintings 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Update leasing_items table (if exists) to use category_id
-- CREATE TABLE IF NOT EXISTS leasing_items (
--   ... existing columns ...
--   category_id UUID REFERENCES categories(id)
-- );

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Insert some default categories
INSERT INTO categories (name, type, color, description) VALUES
  ('Minimalist', 'tattoo', '#8b5cf6', 'Clean and simple designs'),
  ('Traditional', 'tattoo', '#ef4444', 'Classic tattoo style'),
  ('Watercolor', 'tattoo', '#3b82f6', 'Artistic watercolor effect'),
  ('Geometric', 'tattoo', '#10b981', 'Geometric patterns'),
  ('Neo-Traditional', 'tattoo', '#f59e0b', 'Modern take on traditional'),
  ('Fineline', 'tattoo', '#ec4899', 'Delicate fine line work'),
  
  ('Abstract', 'art', '#8b5cf6', 'Abstract artwork'),
  ('Landscape', 'art', '#10b981', 'Landscape paintings'),
  ('Portrait', 'art', '#ef4444', 'Portrait artwork'),
  ('Contemporary', 'art', '#3b82f6', 'Contemporary art'),
  
  ('Corporate', 'leasing', '#1e293b', 'Corporate spaces'),
  ('Residential', 'leasing', '#10b981', 'Residential spaces'),
  ('Temporary', 'leasing', '#f59e0b', 'Short-term leasing')
ON CONFLICT (name) DO NOTHING;
