-- Events & Competitions Schema

-- 1. Create Event Categories
CREATE TABLE IF NOT EXISTS event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location TEXT, -- Can be "Online" or a physical address
    price DECIMAL(10,2) DEFAULT 0.00,
    max_capacity INTEGER,
    category_id UUID REFERENCES event_categories(id),
    type TEXT CHECK (type IN ('event', 'competition')) DEFAULT 'event',
    status TEXT CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'published',
    organizer_id UUID REFERENCES profiles(id),
    is_online BOOLEAN DEFAULT false,
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'confirmed',
    payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    invite_code TEXT, -- To track which invite link was used
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 4. Enable RLS
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Event Categories: Public View
CREATE POLICY "Public can view categories" ON event_categories FOR SELECT USING (true);

-- Events: Public View Published
CREATE POLICY "Public can view published events" ON events FOR SELECT 
USING (status = 'published');

-- Events: Admin Management
CREATE POLICY "Admins can manage all events" ON events FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event Categories: Admin Management
CREATE POLICY "Admins can manage categories" ON event_categories FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event Registrations: Users can view/create their own registrations
CREATE POLICY "Users can view own registrations" ON event_registrations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON event_registrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Insert Default Categories
INSERT INTO event_categories (name, slug, icon) VALUES
('Workshop', 'workshop', 'IconBrush'),
('Competition', 'competition', 'IconTrophy'),
('Exhibition', 'exhibition', 'IconPhoto'),
('Meetup', 'meetup', 'IconUsers'),
('Webinar', 'webinar', 'IconVideo')
ON CONFLICT (name) DO NOTHING;
