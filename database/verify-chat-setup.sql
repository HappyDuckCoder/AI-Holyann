-- ============================================
-- Chat System - Database Verification Script
-- ============================================
-- Run this in Supabase SQL Editor to verify database setup

-- 1. Check if chat tables exist
SELECT
    'Chat Tables' as check_name,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 2 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected 2 tables'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('chat_conversations', 'chat_messages');

-- 2. Check MessageType enum
SELECT
    'MessageType Enum' as check_name,
    COUNT(*) as enum_values,
    CASE
        WHEN COUNT(*) = 4 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected 4 values (TEXT, IMAGE, FILE, SYSTEM)'
    END as status
FROM (
    SELECT unnest(enum_range(NULL::MessageType)) as value
) as enum_check;

-- 3. Check RLS policies on chat_conversations
SELECT
    'RLS Policies (conversations)' as check_name,
    COUNT(*) as policy_count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing policies'
    END as status
FROM pg_policies
WHERE tablename = 'chat_conversations';

-- 4. Check RLS policies on chat_messages
SELECT
    'RLS Policies (messages)' as check_name,
    COUNT(*) as policy_count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS'
        ELSE '❌ FAIL - Missing policies'
    END as status
FROM pg_policies
WHERE tablename = 'chat_messages';

-- 5. Check indexes on chat_conversations
SELECT
    'Indexes (conversations)' as check_name,
    COUNT(*) as index_count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS'
        ELSE '⚠️  WARNING - Consider adding more indexes'
    END as status
FROM pg_indexes
WHERE tablename = 'chat_conversations';

-- 6. Check indexes on chat_messages
SELECT
    'Indexes (messages)' as check_name,
    COUNT(*) as index_count,
    CASE
        WHEN COUNT(*) >= 4 THEN '✅ PASS'
        ELSE '⚠️  WARNING - Consider adding more indexes'
    END as status
FROM pg_indexes
WHERE tablename = 'chat_messages';

-- 7. Check if there are any conversations
SELECT
    'Sample Data (conversations)' as check_name,
    COUNT(*) as record_count,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Has data'
        ELSE 'ℹ️  No data yet - This is OK for initial setup'
    END as status
FROM chat_conversations;

-- 8. Check if there are any messages
SELECT
    'Sample Data (messages)' as check_name,
    COUNT(*) as record_count,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Has data'
        ELSE 'ℹ️  No data yet - This is OK for initial setup'
    END as status
FROM chat_messages;

-- 9. List all RLS policies (for detailed review)
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('chat_conversations', 'chat_messages')
ORDER BY tablename, policyname;

-- 10. Check users table has required fields
SELECT
    'Users Table Structure' as check_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name IN ('id', 'full_name', 'email', 'role', 'avatar_url')
        ) THEN '✅ PASS'
        ELSE '❌ FAIL - Missing required columns'
    END as status;

-- ============================================
-- Summary Report
-- ============================================
SELECT
    '===========================================' as separator
UNION ALL
SELECT 'DATABASE VERIFICATION COMPLETE'
UNION ALL
SELECT '==========================================='
UNION ALL
SELECT ''
UNION ALL
SELECT 'Next Steps:'
UNION ALL
SELECT '1. Verify all checks show ✅ PASS'
UNION ALL
SELECT '2. Run: npx prisma generate'
UNION ALL
SELECT '3. Run: npm run dev'
UNION ALL
SELECT '4. Test chat at /dashboard/chat';
