-- ============================================
-- FIX IMAGE DISPLAY: Bucket Configuration
-- ============================================
-- Run in Supabase SQL Editor to fix image display issues
-- ============================================

-- 1. Check if bucket exists and its settings
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE name = 'hoex-documents';

-- If bucket doesn't exist or is private, you need to:
-- 1. Go to Dashboard → Storage
-- 2. Create "hoex-documents" bucket
-- 3. Set Public = TRUE
-- 4. Set File size limit = 10485760 (10MB)

-- 2. If bucket exists but is private, make it public
UPDATE storage.buckets
SET public = true
WHERE name = 'hoex-documents';

-- 3. Drop any restrictive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public can read files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 4. Create public access policies
CREATE POLICY "Public can read hoex-documents files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hoex-documents');

CREATE POLICY "Authenticated users can upload to hoex-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hoex-documents');

CREATE POLICY "Users can update own files in hoex-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hoex-documents' AND owner = auth.uid());

CREATE POLICY "Users can delete own files in hoex-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hoex-documents' AND owner = auth.uid());

-- 5. Verify policies are created
SELECT
  policyname,
  cmd,
  roles,
  bucket_id
FROM storage.policies
WHERE bucket_id = 'hoex-documents'
ORDER BY policyname;

-- Expected policies:
-- - Public can read hoex-documents files (SELECT, public)
-- - Authenticated users can upload to hoex-documents (INSERT, authenticated)
-- - Users can update own files in hoex-documents (UPDATE, authenticated)
-- - Users can delete own files in hoex-documents (DELETE, authenticated)

-- 6. Test public access (this should work in a web browser)
-- https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/

-- 7. Check existing files in bucket
SELECT
  name,
  id,
  bucket_id,
  owner,
  created_at,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'hoex-documents'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- VERIFICATION STEPS
-- ============================================

-- Step 1: Bucket should be public
SELECT
  CASE
    WHEN public = true THEN '✅ Bucket is PUBLIC (images will display)'
    WHEN public = false THEN '❌ Bucket is PRIVATE (images won\'t display)'
    ELSE '❌ Bucket NOT FOUND'
  END as bucket_status
FROM storage.buckets
WHERE name = 'hoex-documents';

-- Step 2: Policies should allow public read
SELECT
  COUNT(*) as public_read_policies
FROM storage.policies
WHERE bucket_id = 'hoex-documents'
AND cmd = 'SELECT'
AND 'public' = ANY(roles);

-- Should return: public_read_policies = 1

-- Step 3: Test URL format
SELECT
  'Test this URL in browser:' as instruction,
  'https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/' as test_url;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If images still don't display:

-- Issue 1: Bucket not found
-- Solution: Create bucket in Dashboard → Storage

-- Issue 2: Access denied
-- Solution: Make sure bucket is PUBLIC

-- Issue 3: Files not uploading
-- Solution: Check authenticated upload policy exists

-- Issue 4: URLs return 404
-- Solution: Check file path format and bucket name

-- ============================================
-- EXPECTED PUBLIC URL FORMAT
-- ============================================

-- Correct format:
-- https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/[user-id]/chat/[timestamp]_[filename]

-- Example:
-- https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/user123/chat/1707123456789_image.jpg
