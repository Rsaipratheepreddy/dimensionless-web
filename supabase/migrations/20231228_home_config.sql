-- Home Configuration table for CMS
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS home_config (
    id TEXT PRIMARY KEY, -- e.g., 'trending_art', 'trending_tattoos', 'art_leasing', 'home_banner'
    title TEXT NOT NULL,
    description TEXT,
    items JSONB DEFAULT '[]', -- List of featured items/IDs
    image_url TEXT, -- For banners
    link_url TEXT, -- For banners
    config_data JSONB DEFAULT '{}', -- Additional configuration
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Basic setup for current sections
INSERT INTO home_config (id, title, description) VALUES 
('trending_art', 'Trending Art', 'Handpicked artistic masterpieces'),
('trending_tattoos', 'Trending Tattoos', 'The most popular ink designs'),
('art_leasing', 'Art Leasing', 'Premium art for your workspace'),
('home_banner', 'Home Banner', 'Main dashboard hero banner')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE home_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view home_config" ON home_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage home_config" ON home_config FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
