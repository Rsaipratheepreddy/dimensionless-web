-- Blue Chip Art Schema

CREATE TABLE IF NOT EXISTS blue_chip_art (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    valuation DECIMAL(15, 2) NOT NULL, -- in INR
    token_price DECIMAL(15, 2) NOT NULL, -- tokens required
    total_tokens INTEGER NOT NULL,
    available_tokens INTEGER NOT NULL,
    image_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'coming_soon')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Token Locks Table
CREATE TABLE IF NOT EXISTS token_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(18, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    multiplier DECIMAL(5, 2) NOT NULL,
    bonus_amount DECIMAL(18, 2) NOT NULL,
    unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unlocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_token_locks_user ON token_locks(user_id);

-- Enable RLS
ALTER TABLE blue_chip_art ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view blue chip art" ON blue_chip_art;
CREATE POLICY "Public can view blue chip art" ON blue_chip_art FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage blue chip art" ON blue_chip_art;
CREATE POLICY "Admins can manage blue chip art" ON blue_chip_art FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Initial entry for token config if not exists
INSERT INTO home_config (id, title, description, config_data)
VALUES (
    'token_launch_config',
    'Dimen Token Launch Configuration',
    'Global settings for $DIMEN token sales and ecosystem projections',
    '{
        "current_price": 0.50,
        "listing_price": 1.50,
        "total_supply": 100000000,
        "ipo_allocation": 40,
        "raised_amount": 18500000,
        "target_amount": 25000000,
        "investors_count": 1240,
        "growth_projection": [0.5, 0.6, 0.55, 0.8, 1.2, 1.1, 1.5, 1.8, 2.2],
        "lock_config": [
            {"months": 6, "multiplier": 1.05},
            {"months": 12, "multiplier": 1.15},
            {"months": 18, "multiplier": 1.25},
            {"months": 24, "multiplier": 1.45}
        ]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
