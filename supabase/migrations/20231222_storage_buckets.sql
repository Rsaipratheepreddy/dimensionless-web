-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('artwork-images', 'artwork-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects (it's usually enabled by default, but good to ensure security)
-- Note: 'storage.objects' policies are needed for access control.

-- Policy: Give public access to view files in these buckets
CREATE POLICY "Public Access Media" ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Public Access Artwork" ON storage.objects FOR SELECT
USING ( bucket_id = 'artwork-images' );

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Auth Upload Media" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Upload Artwork" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'artwork-images' AND auth.role() = 'authenticated' );

-- Policy: Allow users to update/delete their own files (assuming file path includes user ID or just simple auth check for now)
-- A more secure pattern is strict path checking (e.g., 'uid/filename'), but for this MVP, we'll allow auth users to manage.
CREATE POLICY "Auth Manage Media" ON storage.objects FOR ALL
USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Manage Avatars" ON storage.objects FOR ALL
USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Manage Artwork" ON storage.objects FOR ALL
USING ( bucket_id = 'artwork-images' AND auth.role() = 'authenticated' );
