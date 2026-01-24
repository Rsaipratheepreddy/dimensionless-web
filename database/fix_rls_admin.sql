-- Unified SQL Migration to Fix RLS and Visibility
-- --------------------------------------------------

-- 1. Create robust is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Security Definer ensures this bypasses RLS on the profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Art Classes Module RLS
-- Categories
DROP POLICY IF EXISTS "Categories are publicly readable" ON art_class_categories;
CREATE POLICY "Categories are publicly readable" ON art_class_categories 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON art_class_categories;
CREATE POLICY "Admins can manage categories" ON art_class_categories 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Classes
DROP POLICY IF EXISTS "Published classes are publicly readable" ON art_classes;
CREATE POLICY "Published classes are publicly readable" ON art_classes 
FOR SELECT USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all classes" ON art_classes;
CREATE POLICY "Admins can manage all classes" ON art_classes 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Sessions
DROP POLICY IF EXISTS "Users can see registered sessions" ON art_class_sessions;
DROP POLICY IF EXISTS "Sessions are publicly readable" ON art_class_sessions;
CREATE POLICY "Sessions are publicly readable" ON art_class_sessions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM art_classes 
        WHERE id = art_class_sessions.class_id 
        AND (status = 'published' OR public.is_admin())
    )
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage sessions" ON art_class_sessions;
CREATE POLICY "Admins can manage sessions" ON art_class_sessions 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Registrations
DROP POLICY IF EXISTS "Users can manage their own registrations" ON art_class_registrations;
CREATE POLICY "Users can manage their own registrations" ON art_class_registrations 
FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own registrations" ON art_class_registrations;
CREATE POLICY "Users create their own registrations" ON art_class_registrations 
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all registrations" ON art_class_registrations;
CREATE POLICY "Admins can manage all registrations" ON art_class_registrations 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attendance
DROP POLICY IF EXISTS "Admins can manage attendance" ON art_class_attendance;
CREATE POLICY "Admins can manage attendance" ON art_class_attendance 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Tattoo Module RLS
-- Tattoo Designs
DROP POLICY IF EXISTS "Admins can manage designs" ON tattoo_designs;
CREATE POLICY "Admins can manage designs" ON tattoo_designs 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Tattoo Slots
DROP POLICY IF EXISTS "Admins can manage slots" ON tattoo_slots;
CREATE POLICY "Admins can manage slots" ON tattoo_slots 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Tattoo Bookings
DROP POLICY IF EXISTS "Admins can manage bookings" ON tattoo_bookings;
CREATE POLICY "Admins can manage bookings" ON tattoo_bookings 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Investment Module RLS
-- Token Investments
DROP POLICY IF EXISTS "Admins can manage investments" ON token_investments;
CREATE POLICY "Admins can manage investments" ON token_investments 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Blue Chip Art
DROP POLICY IF EXISTS "Admins can manage blue chip" ON blue_chip_art;
CREATE POLICY "Admins can manage blue chip" ON blue_chip_art 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Core Module RLS
-- Profiles
DROP POLICY IF EXISTS "Admins can manage any profile" ON profiles;
CREATE POLICY "Admins can manage any profile" ON profiles 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Role Permissions
DROP POLICY IF EXISTS "Admins can manage permissions" ON role_permissions;
CREATE POLICY "Admins can manage permissions" ON role_permissions 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Categories (Base)
DROP POLICY IF EXISTS "Admins can manage base categories" ON categories;
CREATE POLICY "Admins can manage base categories" ON categories 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
