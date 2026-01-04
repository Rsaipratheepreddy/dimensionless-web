-- Migration: Enhanced User Roles & Permissions
-- Created: 2026-01-04
-- Description: Implements comprehensive role-based access control system

-- Step 1: Drop existing role column and constraints if they exist
ALTER TABLE profiles DROP COLUMN IF EXISTS role CASCADE;

-- Step 2: Create user_role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employee', 'creator', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Add role and creator-specific columns to profiles
ALTER TABLE profiles 
  ADD COLUMN role user_role DEFAULT 'member' NOT NULL,
  ADD COLUMN IF NOT EXISTS creator_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_name TEXT,
  ADD COLUMN IF NOT EXISTS shop_description TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 15.00;

-- Step 4: Update existing users based on email or other criteria
-- You can manually set specific users as admin
-- Example: UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Step 4: Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  resource TEXT NOT NULL, -- e.g., 'artworks', 'bookings', 'users'
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'manage'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- Step 5: Seed role permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  -- Admin: Full access
  ('admin', '*', '*'),
  
  -- Employee: Manage operations
  ('employee', 'bookings', 'read'),
  ('employee', 'bookings', 'update'),
  ('employee', 'tattoos', 'read'),
  ('employee', 'piercings', 'read'),
  ('employee', 'events', 'read'),
  ('employee', 'users', 'read'),
  ('employee', 'classes', 'read'),
  
  -- Creator: Manage own content
  ('creator', 'artworks', 'create'),
  ('creator', 'artworks', 'read'),
  ('creator', 'artworks', 'update'),
  ('creator', 'artworks', 'delete'),
  ('creator', 'shop', 'manage'),
  ('creator', 'analytics', 'read'),
  ('creator', 'profile', 'update'),
  
  -- Member: Basic access
  ('member', 'artworks', 'read'),
  ('member', 'purchases', 'create'),
  ('member', 'leases', 'create'),
  ('member', 'bookings', 'create'),
  ('member', 'bookings', 'read'),
  ('member', 'profile', 'update'),
  ('member', 'events', 'read'),
  ('member', 'classes', 'read')
ON CONFLICT (role, resource, action) DO NOTHING;

-- Step 6: Create helper function to check permissions
CREATE OR REPLACE FUNCTION has_permission(
  user_id UUID,
  check_resource TEXT,
  check_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
  has_perm BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  
  -- Check if user has permission
  SELECT EXISTS (
    SELECT 1 FROM role_permissions
    WHERE role = user_role
    AND (
      (resource = '*' AND action = '*') OR
      (resource = check_resource AND action = '*') OR
      (resource = '*' AND action = check_action) OR
      (resource = check_resource AND action = check_action)
    )
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- Step 8: Enable RLS on role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Step 9: RLS Policies for role_permissions

-- Everyone can read permissions
CREATE POLICY "Anyone can read role permissions"
  ON role_permissions FOR SELECT
  USING (true);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage role permissions"
  ON role_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 10: Update profiles RLS policies for role management

-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Regular users cannot change their role
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR
      -- Admins can change any role
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
    )
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Employees can view user profiles
CREATE POLICY "Employees can view profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('employee', 'admin')
    )
  );

-- Grant permissions
GRANT ALL ON role_permissions TO authenticated;
GRANT SELECT ON role_permissions TO anon;
