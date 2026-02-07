-- ============================================
-- URGENT FIX: Supabase Realtime Channel Error
-- ============================================
-- Run this in Supabase SQL Editor immediately
-- Project: ahtvzqtykrenluzwajee
-- ============================================

-- 1. Check current realtime publications
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 2. Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;

-- 3. Verify realtime is enabled
SELECT
  schemaname,
  tablename,
  'REALTIME ENABLED ✅' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('chat_messages', 'chat_attachments', 'chat_rooms', 'chat_participants')
ORDER BY tablename;

-- Expected output:
-- public | chat_attachments  | REALTIME ENABLED ✅
-- public | chat_messages     | REALTIME ENABLED ✅
-- public | chat_participants | REALTIME ENABLED ✅
-- public | chat_rooms        | REALTIME ENABLED ✅

-- 4. Check RLS policies are not blocking
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'chat_messages'
ORDER BY policyname;

-- 5. If no policies, create basic ones:
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
CREATE POLICY "Enable read access for all users" ON public.chat_messages
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.chat_messages;
CREATE POLICY "Enable insert for authenticated users only" ON public.chat_messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Final verification query
SELECT
  'REALTIME SETUP COMPLETE' as status,
  COUNT(*) as enabled_tables
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename LIKE 'chat_%';

-- Should return: enabled_tables = 4 (or more)

-- ============================================
-- NEXT STEPS AFTER RUNNING THIS SCRIPT:
-- ============================================
-- 1. Restart your Next.js dev server: npm run dev
-- 2. Clear browser cache (Ctrl+Shift+Delete)
-- 3. Test: http://localhost:3000/test-realtime
-- 4. Status should show: ✅ SUBSCRIBED (green)
-- ============================================
