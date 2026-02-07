-- ============================================
-- FIX SUPABASE STORAGE BUCKET & POLICIES
-- ============================================
-- Run this in Supabase SQL Editor
-- Then configure bucket in Dashboard
-- ============================================

-- 1. Create storage bucket (if not exists)
-- NOTE: This must be done in Supabase Dashboard → Storage
-- Bucket name: hoex-documents
-- Public: YES (for file downloads)

-- 2. Storage Policies for Public Access
-- ============================================

-- Allow public read access to files
CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hoex-documents');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hoex-documents');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hoex-documents' AND owner = auth.uid());

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hoex-documents' AND owner = auth.uid());

-- 3. Verify policies
SELECT * FROM storage.policies WHERE bucket_id = 'hoex-documents';

-- ============================================
-- MANUAL STEPS IN SUPABASE DASHBOARD
-- ============================================

-- Go to: Dashboard → Storage → Create Bucket

-- Bucket Settings:
-- Name: hoex-documents
-- Public: YES ✓
-- Allowed MIME types: (leave empty for all)
-- File size limit: 10 MB

-- After creating bucket, the policies above will work

-- ============================================
-- VERIFICATION
-- ============================================

-- Test URL should work:
-- https://[project-id].supabase.co/storage/v1/object/public/hoex-documents/chat/[user-id]/[filename]
