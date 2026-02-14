-- Create piercings table
CREATE TABLE IF NOT EXISTS piercings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    price DECIMAL(10,2),
    healing_time VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    aftercare_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create art_classes table if not exists (update existing)
CREATE TABLE IF NOT EXISTS art_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    price DECIMAL(10,2),
    duration VARCHAR(255),
    level VARCHAR(255),
    max_students INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    category_id UUID,
    start_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create home_config table with proper schema
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
