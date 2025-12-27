-- RLS Policies for Events Management
-- Created: 2025-12-28

-- 1. Events Table Policies
DROP POLICY IF EXISTS "Admins can manage all events" ON events;
CREATE POLICY "Admins can manage all events" ON events
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Event Categories Policies
DROP POLICY IF EXISTS "Admins can manage categories" ON event_categories;
CREATE POLICY "Admins can manage categories" ON event_categories
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
