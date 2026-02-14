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

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_piercings_is_active ON piercings(is_active);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_piercings_created_at ON piercings(created_at DESC);
