-- Fix RLS Policies for Events
-- Making them explicit for INSERT/UPDATE/DELETE

-- 1. Events Table
DROP POLICY IF EXISTS "Admins can manage all events" ON events;

CREATE POLICY "Admins can manage all events" ON events
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role::text = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role::text = 'admin'
    )
);

-- 2. Event Categories Table
DROP POLICY IF EXISTS "Admins can manage categories" ON event_categories;

CREATE POLICY "Admins can manage categories" ON event_categories
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role::text = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role::text = 'admin'
    )
);

-- 3. Public access for events (Read Only)
DROP POLICY IF EXISTS "Public can view published events" ON events;
CREATE POLICY "Public can view published events" ON events
FOR SELECT TO anon, authenticated
USING (status = 'published');

-- 4. Public access for categories (Read Only)
DROP POLICY IF EXISTS "Public can view event categories" ON event_categories;
CREATE POLICY "Public can view event categories" ON event_categories
FOR SELECT TO anon, authenticated
USING (true);
