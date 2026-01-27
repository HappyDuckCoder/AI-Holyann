-- Enable Realtime for chat tables in Supabase
-- Run this in Supabase SQL Editor

-- 1. Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 2. Enable realtime for chat_rooms table (optional, for room status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- 3. Enable realtime for chat_participants table (optional, for participant updates)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;

-- Verify publications
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
