-- Fix RLS Performance Issue on tattoo_designs
-- The existing RLS policy is causing statement timeouts
-- This migration simplifies the policy for better performance

-- Drop the problematic policy
DROP POLICY IF EXISTS "Public can view active designs" ON tattoo_designs;

-- Create a simpler, more performant policy
-- This policy is more direct and doesn't require complex subqueries
CREATE POLICY "Public can view active designs" ON tattoo_designs
    FOR SELECT 
    TO anon, authenticated
    USING (is_active = true);

-- Ensure indices are in place
CREATE INDEX IF NOT EXISTS idx_tattoo_designs_is_active_created_at 
ON tattoo_designs(is_active, created_at DESC) 
WHERE is_active = true;

-- Update table statistics
ANALYZE tattoo_designs;
