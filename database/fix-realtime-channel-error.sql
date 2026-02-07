-- ============================================
-- QUICK FIX: Supabase Realtime CHANNEL_ERROR
-- ============================================
-- Run this script in Supabase SQL Editor
-- Last Updated: February 6, 2026
-- ============================================

-- STEP 1: Enable Realtime for Chat Tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_attachments;

-- STEP 2: Drop Existing Policies (Clean Slate)
-- ============================================
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view attachments in their rooms" ON chat_attachments;
DROP POLICY IF EXISTS "Users can add attachments to their messages" ON chat_attachments;
DROP POLICY IF EXISTS "Users can view their rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON chat_participants;

-- STEP 3: Enable Row Level Security
-- ============================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create Policies for chat_messages
-- ============================================

-- Allow users to view messages in rooms they participate in
CREATE POLICY "Users can view messages in their rooms"
ON chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_messages.room_id
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.is_active = true
  )
);

-- Allow users to send messages
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Allow users to update their own messages
CREATE POLICY "Users can update own messages"
ON chat_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- STEP 5: Create Policies for chat_attachments
-- ============================================

-- Allow users to view attachments in their rooms
CREATE POLICY "Users can view attachments in their rooms"
ON chat_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM chat_messages
    JOIN chat_participants ON chat_participants.room_id = chat_messages.room_id
    WHERE chat_messages.id = chat_attachments.message_id
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.is_active = true
  )
);

-- Allow users to add attachments to their own messages
CREATE POLICY "Users can add attachments to their messages"
ON chat_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_messages
    WHERE chat_messages.id = chat_attachments.message_id
    AND chat_messages.sender_id = auth.uid()
  )
);

-- STEP 6: Create Policies for chat_rooms
-- ============================================

-- Allow users to view rooms they participate in
CREATE POLICY "Users can view their rooms"
ON chat_rooms FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_rooms.id
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.is_active = true
  )
);

-- Allow users to update rooms they participate in (for last_read, etc.)
CREATE POLICY "Users can update their room status"
ON chat_rooms FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = chat_rooms.id
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.is_active = true
  )
);

-- STEP 7: Create Policies for chat_participants
-- ============================================

-- Allow users to view participants in rooms they're part of
CREATE POLICY "Users can view participants in their rooms"
ON chat_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.room_id = chat_participants.room_id
    AND cp.user_id = auth.uid()
    AND cp.is_active = true
  )
);

-- Allow users to update their own participant status
CREATE POLICY "Users can update their participant status"
ON chat_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- STEP 8: Verification Queries
-- ============================================

-- Verify Realtime is enabled
SELECT
  schemaname,
  tablename,
  'Realtime Enabled' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('chat_messages', 'chat_attachments', 'chat_rooms', 'chat_participants')
ORDER BY tablename;

-- Expected output:
-- public | chat_attachments  | Realtime Enabled
-- public | chat_messages     | Realtime Enabled
-- public | chat_participants | Realtime Enabled
-- public | chat_rooms        | Realtime Enabled

-- Verify RLS Policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN roles = '{authenticated}' THEN 'Authenticated Users'
    ELSE roles::text
  END as applies_to
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('chat_messages', 'chat_attachments', 'chat_rooms', 'chat_participants')
ORDER BY tablename, policyname;

-- Check RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('chat_messages', 'chat_attachments', 'chat_rooms', 'chat_participants')
ORDER BY tablename;

-- All should show: rls_enabled = true

-- ============================================
-- DONE!
-- ============================================
-- Next steps:
-- 1. Restart your Next.js app: npm run dev
-- 2. Clear browser cache or use Incognito mode
-- 3. Test realtime: http://localhost:3000/test-realtime
-- 4. Open 2 tabs and send message → Should appear instantly
-- ============================================

-- Troubleshooting:
-- If still getting CHANNEL_ERROR:
-- 1. Check .env.local has correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 2. Verify in Supabase Dashboard → Settings → API
-- 3. Check browser console for detailed error messages
-- 4. See REALTIME_CHANNEL_ERROR_FIX.md for more details
