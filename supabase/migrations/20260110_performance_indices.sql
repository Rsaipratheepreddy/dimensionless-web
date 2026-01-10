-- Performance Optimization Indices
-- Target: Common dashboard and discovery queries

-- Artworks
CREATE INDEX IF NOT EXISTS idx_artworks_status_created_at ON artworks(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_allow_purchase ON artworks(allow_purchase) WHERE allow_purchase = true;
CREATE INDEX IF NOT EXISTS idx_artworks_allow_lease ON artworks(allow_lease) WHERE allow_lease = true;

-- Artwork Images
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_images_is_primary ON artwork_images(is_primary) WHERE is_primary = true;

-- Event Registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_status_start_date ON events(status, start_date);

-- Tattoo Designs
CREATE INDEX IF NOT EXISTS idx_tattoo_designs_is_active_created_at ON tattoo_designs(is_active, created_at DESC);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
