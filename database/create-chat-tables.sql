-- Chat System Tables
-- This script creates the necessary tables for real-time chat functionality

-- Create MessageType enum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    mentor_id UUID NOT NULL,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP(6),

    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_student_mentor UNIQUE (student_id, mentor_id)
);

-- Create indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_student_id ON chat_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_mentor_id ON chat_conversations(mentor_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message_at ON chat_conversations(last_message_at);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type "MessageType" DEFAULT 'TEXT',
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
-- Students can only see their own conversations
CREATE POLICY "Students can view own conversations" ON chat_conversations
    FOR SELECT
    USING (
        auth.uid() = student_id OR
        auth.uid() = mentor_id
    );

-- Students can create conversations with mentors
CREATE POLICY "Students can create conversations" ON chat_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Mentors can view conversations where they are assigned
CREATE POLICY "Mentors can view assigned conversations" ON chat_conversations
    FOR SELECT
    USING (auth.uid() = mentor_id);

-- RLS Policies for chat_messages
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_conversations
            WHERE chat_conversations.id = chat_messages.conversation_id
            AND (chat_conversations.student_id = auth.uid() OR chat_conversations.mentor_id = auth.uid())
        )
    );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations" ON chat_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_conversations
            WHERE chat_conversations.id = conversation_id
            AND (chat_conversations.student_id = auth.uid() OR chat_conversations.mentor_id = auth.uid())
        )
    );

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update messages" ON chat_messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM chat_conversations
            WHERE chat_conversations.id = chat_messages.conversation_id
            AND (chat_conversations.student_id = auth.uid() OR chat_conversations.mentor_id = auth.uid())
        )
    );

-- Function to update conversation's last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_conversations
    SET last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_message_at
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON chat_messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID, conversation_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM chat_messages
        WHERE conversation_id = conversation_uuid
        AND sender_id != user_uuid
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql;

-- Create view for conversation list with unread counts
CREATE OR REPLACE VIEW conversation_list AS
SELECT
    c.id,
    c.student_id,
    c.mentor_id,
    c.created_at,
    c.updated_at,
    c.last_message_at,
    student.full_name as student_name,
    student.avatar_url as student_avatar,
    student.email as student_email,
    mentor.full_name as mentor_name,
    mentor.avatar_url as mentor_avatar,
    mentor.email as mentor_email,
    (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
    (SELECT created_at FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
FROM chat_conversations c
LEFT JOIN users student ON c.student_id = student.id
LEFT JOIN users mentor ON c.mentor_id = mentor.id;

COMMENT ON TABLE chat_conversations IS 'Stores chat conversations between students and mentors';
COMMENT ON TABLE chat_messages IS 'Stores individual messages in conversations';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: TEXT, IMAGE, FILE, or SYSTEM';
COMMENT ON COLUMN chat_messages.is_read IS 'Whether the message has been read by the recipient';
