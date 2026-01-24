-- Unified Admin RLS Fix
-- Introduces a SECURITY DEFINER function to check for admin status
-- and updates all tables to use it, preventing recursive subqueries and performance issues.

-- 1. Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Profiles RLS (Fix potential recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles 
FOR UPDATE USING (public.is_admin());

-- 3. Update Categories RLS
DROP POLICY IF EXISTS "Admins can manage all categories" ON categories;
CREATE POLICY "Admins can manage all categories" ON categories 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Update Art Classes Module RLS
-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON art_class_categories;
CREATE POLICY "Admins can manage categories" ON art_class_categories 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Classes
DROP POLICY IF EXISTS "Admins can manage all classes" ON art_classes;
CREATE POLICY "Admins can manage all classes" ON art_classes 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Sessions
DROP POLICY IF EXISTS "Admins can manage sessions" ON art_class_sessions;
CREATE POLICY "Admins can manage sessions" ON art_class_sessions 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Registrations
DROP POLICY IF EXISTS "Admins can manage all registrations" ON art_class_registrations;
CREATE POLICY "Admins can manage all registrations" ON art_class_registrations 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attendance
DROP POLICY IF EXISTS "Admins can manage attendance" ON art_class_attendance;
CREATE POLICY "Admins can manage attendance" ON art_class_attendance 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Update Tattoo Booking Module RLS
-- Designs
DROP POLICY IF EXISTS "Admins can manage all designs" ON tattoo_designs;
CREATE POLICY "Admins can manage all designs" ON tattoo_designs 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Slots
DROP POLICY IF EXISTS "Admins can manage all slots" ON tattoo_slots;
CREATE POLICY "Admins can manage all slots" ON tattoo_slots 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON tattoo_bookings;
CREATE POLICY "Admins can view all bookings" ON tattoo_bookings 
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all bookings" ON tattoo_bookings;
CREATE POLICY "Admins can manage all bookings" ON tattoo_bookings 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Update Token Investments RLS
DROP POLICY IF EXISTS "Admins can view all investments" ON token_investments;
CREATE POLICY "Admins can view all investments" ON token_investments 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Update Blue Chip Art RLS
DROP POLICY IF EXISTS "Admins can manage blue chip art" ON blue_chip_art;
CREATE POLICY "Admins can manage blue chip art" ON blue_chip_art 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Update Role Permissions RLS
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;
CREATE POLICY "Admins can manage role permissions" ON role_permissions 
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
