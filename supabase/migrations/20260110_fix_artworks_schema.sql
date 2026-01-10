-- Migration: Add missing columns to artworks table
-- Created: 2026-01-10

ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS design_style TEXT,
ADD COLUMN IF NOT EXISTS delivery_info TEXT,
ADD COLUMN IF NOT EXISTS allow_purchase BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_lease BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';
