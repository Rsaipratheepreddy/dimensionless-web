-- Tattoo Booking System Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tattoo Designs Table
CREATE TABLE IF NOT EXISTS tattoo_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  size VARCHAR(50), -- e.g., "Small", "Medium", "Large"
  estimated_duration INTEGER, -- in minutes
  base_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  artist_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tattoo Slots Table (Admin-Configured)
CREATE TABLE IF NOT EXISTS tattoo_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  artist_id UUID REFERENCES profiles(id),
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, start_time, artist_id)
);

-- 3. Tattoo Bookings Table
CREATE TABLE IF NOT EXISTS tattoo_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  design_id UUID REFERENCES tattoo_designs(id),
  slot_id UUID REFERENCES tattoo_slots(id), -- NULL if no configured slots (flexible booking)
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  artist_id UUID REFERENCES profiles(id),
  
  -- Pricing
  final_price DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method VARCHAR(50) NOT NULL, -- 'online' or 'counter'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_id VARCHAR(255), -- Razorpay/Stripe payment ID
  razorpay_order_id VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  
  -- Additional Info
  custom_notes TEXT,
  reference_images TEXT[], -- Array of image URLs
  user_mobile TEXT,
  
  -- Cancellation
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10, 2),
  refund_status VARCHAR(50), -- 'pending', 'processed', 'failed'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tattoo_designs_category ON tattoo_designs(category_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_designs_is_active ON tattoo_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_tattoo_designs_artist ON tattoo_designs(artist_id);

CREATE INDEX IF NOT EXISTS idx_tattoo_slots_date ON tattoo_slots(date);
CREATE INDEX IF NOT EXISTS idx_tattoo_slots_artist ON tattoo_slots(artist_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_slots_available ON tattoo_slots(is_available);

CREATE INDEX IF NOT EXISTS idx_tattoo_bookings_user ON tattoo_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_bookings_date ON tattoo_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_tattoo_bookings_status ON tattoo_bookings(status);
CREATE INDEX IF NOT EXISTS idx_tattoo_bookings_payment_status ON tattoo_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_tattoo_bookings_artist ON tattoo_bookings(artist_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tattoo_designs_updated_at ON tattoo_designs;
CREATE TRIGGER update_tattoo_designs_updated_at BEFORE UPDATE ON tattoo_designs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tattoo_slots_updated_at ON tattoo_slots;
CREATE TRIGGER update_tattoo_slots_updated_at BEFORE UPDATE ON tattoo_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tattoo_bookings_updated_at ON tattoo_bookings;
CREATE TRIGGER update_tattoo_bookings_updated_at BEFORE UPDATE ON tattoo_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update slot current_bookings
CREATE OR REPLACE FUNCTION update_slot_bookings()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.slot_id IS NOT NULL THEN
        UPDATE tattoo_slots 
        SET current_bookings = current_bookings + 1,
            is_available = CASE 
                WHEN current_bookings + 1 >= max_bookings THEN false 
                ELSE true 
            END
        WHERE id = NEW.slot_id;
    ELSIF TG_OP = 'DELETE' AND OLD.slot_id IS NOT NULL THEN
        UPDATE tattoo_slots 
        SET current_bookings = GREATEST(current_bookings - 1, 0),
            is_available = true
        WHERE id = OLD.slot_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND NEW.slot_id IS NOT NULL THEN
        UPDATE tattoo_slots 
        SET current_bookings = GREATEST(current_bookings - 1, 0),
            is_available = true
        WHERE id = NEW.slot_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS manage_slot_bookings ON tattoo_bookings;
CREATE TRIGGER manage_slot_bookings
AFTER INSERT OR UPDATE OR DELETE ON tattoo_bookings
FOR EACH ROW EXECUTE FUNCTION update_slot_bookings();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE tattoo_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattoo_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tattoo_bookings ENABLE ROW LEVEL SECURITY;

-- Tattoo Designs Policies
DROP POLICY IF EXISTS "Public can view active designs" ON tattoo_designs;
CREATE POLICY "Public can view active designs" ON tattoo_designs
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all designs" ON tattoo_designs;
CREATE POLICY "Admins can manage all designs" ON tattoo_designs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Tattoo Slots Policies
DROP POLICY IF EXISTS "Public can view available slots" ON tattoo_slots;
CREATE POLICY "Public can view available slots" ON tattoo_slots
    FOR SELECT USING (is_available = true AND date >= CURRENT_DATE);

DROP POLICY IF EXISTS "Admins can manage all slots" ON tattoo_slots;
CREATE POLICY "Admins can manage all slots" ON tattoo_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Tattoo Bookings Policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON tattoo_bookings;
CREATE POLICY "Users can view their own bookings" ON tattoo_bookings
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create bookings" ON tattoo_bookings;
CREATE POLICY "Users can create bookings" ON tattoo_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own bookings" ON tattoo_bookings;
CREATE POLICY "Users can update their own bookings" ON tattoo_bookings
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all bookings" ON tattoo_bookings;
CREATE POLICY "Admins can view all bookings" ON tattoo_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage all bookings" ON tattoo_bookings;
CREATE POLICY "Admins can manage all bookings" ON tattoo_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
