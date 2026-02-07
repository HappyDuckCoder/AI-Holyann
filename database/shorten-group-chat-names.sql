-- Update existing GROUP chat room names to shorter format
-- From: "Nhóm hỗ trợ học tập (Full Team) - st2"
-- To: "Nhóm mentor - st2"

UPDATE chat_rooms
SET name = REGEXP_REPLACE(name, '^Nhóm hỗ trợ học tập \(Full Team\) - ', 'Nhóm mentor - ')
WHERE type = 'GROUP'
  AND name LIKE 'Nhóm hỗ trợ học tập (Full Team) - %';

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
