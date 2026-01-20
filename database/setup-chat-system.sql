-- Enable Realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for chat_rooms
CREATE POLICY "Users can view their own rooms" ON chat_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = chat_rooms.id
      AND chat_participants.user_id = auth.uid()::text
      AND chat_participants.is_active = true
    )
  );

-- Policies for chat_participants
CREATE POLICY "Users can view participants in their rooms" ON chat_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_participants.room_id
      AND cp.user_id = auth.uid()::text
      AND cp.is_active = true
    )
  );

CREATE POLICY "Users can update their own participant record" ON chat_participants
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_id = auth.uid()::text
      AND chat_participants.is_active = true
    )
  );

CREATE POLICY "Users can send messages to their rooms" ON chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.room_id = chat_messages.room_id
      AND chat_participants.user_id = auth.uid()::text
      AND chat_participants.is_active = true
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE
  USING (sender_id = auth.uid()::text);

-- Policies for chat_attachments
CREATE POLICY "Users can view attachments in their rooms" ON chat_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_participants cp ON cp.room_id = cm.room_id
      WHERE cm.id = chat_attachments.message_id
      AND cp.user_id = auth.uid()::text
      AND cp.is_active = true
    )
  );

-- Policies for mentor_assignments
CREATE POLICY "Students can view their own assignments" ON mentor_assignments
  FOR SELECT
  USING (student_id = auth.uid()::text);

CREATE POLICY "Mentors can view their assignments" ON mentor_assignments
  FOR SELECT
  USING (
    mentor_as_id = auth.uid()::text
    OR mentor_acs_id = auth.uid()::text
    OR mentor_ard_id = auth.uid()::text
  );

CREATE POLICY "Admins can manage assignments" ON mentor_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_student ON chat_rooms(student_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
