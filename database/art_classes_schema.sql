-- Art Classes Module Schema

-- 1. Class Categories
CREATE TABLE IF NOT EXISTS art_class_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Art Classes
CREATE TABLE IF NOT EXISTS art_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category_id UUID REFERENCES art_class_categories(id),
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('free', 'one_time', 'subscription')),
    price DECIMAL(12, 2) DEFAULT 0,
    subscription_duration INTEGER, -- in days
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Class Sessions
CREATE TABLE IF NOT EXISTS art_class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES art_classes(id) ON DELETE CASCADE,
    session_title TEXT,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    session_link TEXT, -- Zoom/Meet link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. User Registrations
CREATE TABLE IF NOT EXISTS art_class_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    class_id UUID REFERENCES art_classes(id),
    type TEXT NOT NULL CHECK (type IN ('free', 'one_time', 'subscription')),
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    payment_status TEXT DEFAULT 'pending',
    sub_start_date DATE,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, class_id)
);

-- 5. Attendance Tracking
CREATE TABLE IF NOT EXISTS art_class_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES art_class_registrations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES art_class_sessions(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(registration_id, session_id)
);

-- Enable RLS
ALTER TABLE art_class_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_class_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: Publicly readable, Admins can manage
DROP POLICY IF EXISTS "Categories are publicly readable" ON art_class_categories;
CREATE POLICY "Categories are publicly readable" ON art_class_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON art_class_categories;
CREATE POLICY "Admins can manage categories" ON art_class_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Classes: Publicly readable if published, Admins can manage all
DROP POLICY IF EXISTS "Published classes are publicly readable" ON art_classes;
CREATE POLICY "Published classes are publicly readable" ON art_classes FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage all classes" ON art_classes;
CREATE POLICY "Admins can manage all classes" ON art_classes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sessions: Public can see session schedule for published classes, Admins can manage all
DROP POLICY IF EXISTS "Users can see registered sessions" ON art_class_sessions;
CREATE POLICY "Users can see registered sessions" ON art_class_sessions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM art_classes 
        WHERE id = art_class_sessions.class_id 
        AND status = 'published'
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage sessions" ON art_class_sessions;
CREATE POLICY "Admins can manage sessions" ON art_class_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Registrations: User can see/create their own, Admins can see all
DROP POLICY IF EXISTS "Users can manage their own registrations" ON art_class_registrations;
CREATE POLICY "Users can manage their own registrations" ON art_class_registrations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own registrations" ON art_class_registrations;
CREATE POLICY "Users can create their own registrations" ON art_class_registrations FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all registrations" ON art_class_registrations;
CREATE POLICY "Admins can manage all registrations" ON art_class_registrations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Attendance: User can see their own, Admins can manage all
DROP POLICY IF EXISTS "Users can see their own attendance" ON art_class_attendance;
CREATE POLICY "Users can see their own attendance" ON art_class_attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM art_class_registrations WHERE id = art_class_attendance.registration_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage attendance" ON art_class_attendance;
CREATE POLICY "Admins can manage attendance" ON art_class_attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_art_classes_category ON art_classes(category_id);
CREATE INDEX IF NOT EXISTS idx_art_class_sessions_class ON art_class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_art_class_registrations_user ON art_class_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_art_class_registrations_class ON art_class_registrations(class_id);
