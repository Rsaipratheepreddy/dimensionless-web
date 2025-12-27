-- Add Online/Offline support for events
-- Created: 2025-12-28

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meeting_link TEXT;
