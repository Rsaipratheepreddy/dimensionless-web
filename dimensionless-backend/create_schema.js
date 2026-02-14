const { Client } = require('pg');

const RDS_CONFIG = {
  host: 'dimensionless-db.cbaeu2kkebwk.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'dimensionless',
  user: 'postgres',
  password: 'DimensionlessPass2024',
  ssl: {
    rejectUnauthorized: false
  }
};

// Basic table schemas based on the entities
const TABLES_SQL = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS artwork_images CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS tattoo_bookings CASCADE;
DROP TABLE IF EXISTS piercing_bookings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  about TEXT,
  artist_id UUID REFERENCES users(id),
  artist_name VARCHAR(255),
  purchase_price DECIMAL(10,2),
  lease_monthly_rate DECIMAL(10,2),
  lease_security_deposit DECIMAL(10,2),
  medium VARCHAR(255),
  dimensions VARCHAR(255),
  year_created INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  tags TEXT[],
  category VARCHAR(255),
  stock_quantity INTEGER DEFAULT 1,
  origin VARCHAR(255),
  design_style VARCHAR(255),
  delivery_info TEXT,
  variants JSONB,
  allow_purchase BOOLEAN DEFAULT true,
  allow_lease BOOLEAN DEFAULT true,
  avg_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0
);

-- Artwork Images table
CREATE TABLE IF NOT EXISTS artwork_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  banner_url TEXT,
  date TIMESTAMPTZ,
  location VARCHAR(255),
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tattoo Designs table
CREATE TABLE IF NOT EXISTS tattoo_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  description TEXT,
  size VARCHAR(100),
  estimated_duration VARCHAR(100),
  base_price DECIMAL(10,2),
  image_url TEXT,
  artist_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tattoo Bookings table
CREATE TABLE IF NOT EXISTS tattoo_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  design_id UUID REFERENCES tattoo_designs(id),
  artist_name VARCHAR(255),
  design_description TEXT,
  size VARCHAR(100),
  estimated_duration VARCHAR(100),
  base_price DECIMAL(10,2),
  booking_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Piercing Bookings table
CREATE TABLE IF NOT EXISTS piercing_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  piercing_type VARCHAR(255),
  artist_name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  booking_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  description TEXT,
  color VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Classes table
CREATE TABLE IF NOT EXISTS art_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  duration VARCHAR(100),
  price DECIMAL(10,2),
  max_participants INTEGER,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Bookings table
CREATE TABLE IF NOT EXISTS class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES art_classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'booked',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  post_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home Config table
CREATE TABLE IF NOT EXISTS home_config (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  items JSONB,
  image_url TEXT,
  link_url TEXT,
  config_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
`;

async function createSchema() {
  const client = new Client(RDS_CONFIG);
  await client.connect();

  try {
    console.log('Creating database schema...');
    await client.query(TABLES_SQL);
    console.log('Schema created successfully!');

    // Verify tables were created
    const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await client.end();
  }
}

createSchema().catch(console.error);
