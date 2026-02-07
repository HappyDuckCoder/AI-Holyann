-- Update existing GROUP chat room names from "Student - Group Mentor" to "Nhóm mentor - Student"
-- This script updates existing chat rooms that were created with the old naming convention

UPDATE chat_rooms
SET name = CONCAT('Nhóm mentor - ', (
    SELECT users.full_name
    FROM users
    WHERE users.id = chat_rooms.student_id
))
WHERE type = 'GROUP'
  AND name LIKE '% - Group Mentor'
  AND student_id IS NOT NULL;

-- Verify the update
SELECT
    id,
    name,
    type,
    student_id,
    created_at
FROM chat_rooms
WHERE type = 'GROUP'
ORDER BY created_at DESC;

-- Expected result: Names should now be "Nhóm mentor - [Student Name]"
