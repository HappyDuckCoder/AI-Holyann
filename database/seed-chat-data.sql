-- Seed chat data for testing
-- This script creates 4 chat rooms: 3 private chats and 1 group chat

-- First, clean up existing chat data
DELETE FROM chat_attachments;
DELETE FROM chat_messages;
DELETE FROM chat_participants;
DELETE FROM chat_rooms;

-- Get user IDs (adjust these based on your actual user emails)
DO $$
DECLARE
    v_st_id UUID;
    v_as_id UUID;
    v_acs_id UUID;
    v_ard_id UUID;
    v_room_as_id UUID;
    v_room_acs_id UUID;
    v_room_ard_id UUID;
    v_room_group_id UUID;
BEGIN
    -- Find users
    SELECT id INTO v_st_id FROM users WHERE email LIKE '%st%' LIMIT 1;
    SELECT id INTO v_as_id FROM users WHERE email LIKE '%as@%' OR email LIKE 'mentor-as%' LIMIT 1;
    SELECT id INTO v_acs_id FROM users WHERE email LIKE '%acs%' LIMIT 1;
    SELECT id INTO v_ard_id FROM users WHERE email LIKE '%ard%' LIMIT 1;

    IF v_st_id IS NULL OR v_as_id IS NULL OR v_acs_id IS NULL OR v_ard_id IS NULL THEN
        RAISE EXCEPTION 'Missing users. Please ensure users with emails containing st, as, acs, ard exist.';
    END IF;

    RAISE NOTICE 'Found users: st=%, as=%, acs=%, ard=%', v_st_id, v_as_id, v_acs_id, v_ard_id;

    -- Create Room 1: st <-> as (Academic Support)
    v_room_as_id := gen_random_uuid();
    INSERT INTO chat_rooms (id, name, type, status, student_id, mentor_type, created_at, updated_at)
    VALUES (
        v_room_as_id,
        (SELECT full_name FROM users WHERE id = v_as_id),
        'PRIVATE',
        'ACTIVE',
        v_st_id,
        'AS',
        '2026-01-20 10:00:00+00',
        '2026-01-20 10:10:00+00'
    );

    -- Participants for Room AS
    INSERT INTO chat_participants (id, room_id, user_id, is_active, joined_at)
    VALUES
        (gen_random_uuid(), v_room_as_id, v_st_id, true, '2026-01-20 10:00:00+00'),
        (gen_random_uuid(), v_room_as_id, v_as_id, true, '2026-01-20 10:00:00+00');

    -- Messages for Room AS
    INSERT INTO chat_messages (id, room_id, sender_id, content, type, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_room_as_id, v_st_id, 'Chào thầy, em muốn hỏi về chương trình học bổng ạ!', 'TEXT', '2026-01-20 10:00:00+00', '2026-01-20 10:00:00+00'),
        (gen_random_uuid(), v_room_as_id, v_as_id, 'Chào em! Thầy có thể giúp em tìm hiểu về các chương trình học bổng phù hợp.', 'TEXT', '2026-01-20 10:05:00+00', '2026-01-20 10:05:00+00'),
        (gen_random_uuid(), v_room_as_id, v_st_id, 'Em đang muốn tìm học bổng toàn phần cho ngành Computer Science ở Mỹ ạ', 'TEXT', '2026-01-20 10:10:00+00', '2026-01-20 10:10:00+00');

    -- Create Room 2: st <-> acs (Application & Career Support)
    v_room_acs_id := gen_random_uuid();
    INSERT INTO chat_rooms (id, name, type, status, student_id, mentor_type, created_at, updated_at)
    VALUES (
        v_room_acs_id,
        (SELECT full_name FROM users WHERE id = v_acs_id),
        'PRIVATE',
        'ACTIVE',
        v_st_id,
        'ACS',
        '2026-01-21 09:00:00+00',
        '2026-01-21 09:10:00+00'
    );

    -- Participants for Room ACS
    INSERT INTO chat_participants (id, room_id, user_id, is_active, joined_at)
    VALUES
        (gen_random_uuid(), v_room_acs_id, v_st_id, true, '2026-01-21 09:00:00+00'),
        (gen_random_uuid(), v_room_acs_id, v_acs_id, true, '2026-01-21 09:00:00+00');

    -- Messages for Room ACS
    INSERT INTO chat_messages (id, room_id, sender_id, content, type, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_room_acs_id, v_st_id, 'Chào cô, em cần tư vấn về CV và essay ạ', 'TEXT', '2026-01-21 09:00:00+00', '2026-01-21 09:00:00+00'),
        (gen_random_uuid(), v_room_acs_id, v_acs_id, 'Chào em! Cô sẽ giúp em review CV và essay. Em gửi file cho cô nhé.', 'TEXT', '2026-01-21 09:05:00+00', '2026-01-21 09:05:00+00'),
        (gen_random_uuid(), v_room_acs_id, v_st_id, 'Dạ, em cảm ơn cô ạ!', 'TEXT', '2026-01-21 09:10:00+00', '2026-01-21 09:10:00+00');

    -- Create Room 3: st <-> ard (Admission & Research Development)
    v_room_ard_id := gen_random_uuid();
    INSERT INTO chat_rooms (id, name, type, status, student_id, mentor_type, created_at, updated_at)
    VALUES (
        v_room_ard_id,
        (SELECT full_name FROM users WHERE id = v_ard_id),
        'PRIVATE',
        'ACTIVE',
        v_st_id,
        'ARD',
        '2026-01-22 14:00:00+00',
        '2026-01-22 14:10:00+00'
    );

    -- Participants for Room ARD
    INSERT INTO chat_participants (id, room_id, user_id, is_active, joined_at)
    VALUES
        (gen_random_uuid(), v_room_ard_id, v_st_id, true, '2026-01-22 14:00:00+00'),
        (gen_random_uuid(), v_room_ard_id, v_ard_id, true, '2026-01-22 14:00:00+00');

    -- Messages for Room ARD
    INSERT INTO chat_messages (id, room_id, sender_id, content, type, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_room_ard_id, v_st_id, 'Chào anh, em muốn tìm hiểu về quy trình admission của MIT ạ', 'TEXT', '2026-01-22 14:00:00+00', '2026-01-22 14:00:00+00'),
        (gen_random_uuid(), v_room_ard_id, v_ard_id, 'Hi! MIT có quy trình admission rất khắt khe. Anh sẽ hướng dẫn em chi tiết nhé.', 'TEXT', '2026-01-22 14:10:00+00', '2026-01-22 14:10:00+00');

    -- Create Room 4: Group chat with all 4 users
    v_room_group_id := gen_random_uuid();
    INSERT INTO chat_rooms (id, name, type, status, student_id, created_at, updated_at)
    VALUES (
        v_room_group_id,
        'Nhóm tư vấn học bổng',
        'GROUP',
        'ACTIVE',
        v_st_id,
        '2026-01-23 08:00:00+00',
        '2026-01-23 08:20:00+00'
    );

    -- Participants for Group Room
    INSERT INTO chat_participants (id, room_id, user_id, is_active, joined_at)
    VALUES
        (gen_random_uuid(), v_room_group_id, v_st_id, true, '2026-01-23 08:00:00+00'),
        (gen_random_uuid(), v_room_group_id, v_as_id, true, '2026-01-23 08:00:00+00'),
        (gen_random_uuid(), v_room_group_id, v_acs_id, true, '2026-01-23 08:00:00+00'),
        (gen_random_uuid(), v_room_group_id, v_ard_id, true, '2026-01-23 08:00:00+00');

    -- Messages for Group Room
    INSERT INTO chat_messages (id, room_id, sender_id, content, type, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_room_group_id, v_as_id, 'Chào mọi người! Hôm nay chúng ta sẽ thảo luận về kế hoạch du học của bạn st nhé.', 'TEXT', '2026-01-23 08:00:00+00', '2026-01-23 08:00:00+00'),
        (gen_random_uuid(), v_room_group_id, v_st_id, 'Chào mọi người! Em rất vui được làm việc với các thầy cô ạ.', 'TEXT', '2026-01-23 08:05:00+00', '2026-01-23 08:05:00+00'),
        (gen_random_uuid(), v_room_group_id, v_acs_id, 'Chào em! Cô đã xem qua hồ sơ của em, khá tốt đấy.', 'TEXT', '2026-01-23 08:10:00+00', '2026-01-23 08:10:00+00'),
        (gen_random_uuid(), v_room_group_id, v_ard_id, 'Em có thể chia sẻ về mục tiêu nghề nghiệp của mình không?', 'TEXT', '2026-01-23 08:15:00+00', '2026-01-23 08:15:00+00'),
        (gen_random_uuid(), v_room_group_id, v_st_id, 'Dạ, em muốn trở thành Software Engineer và làm việc trong lĩnh vực AI/ML ạ.', 'TEXT', '2026-01-23 08:20:00+00', '2026-01-23 08:20:00+00');

    RAISE NOTICE 'Chat data seeded successfully!';
    RAISE NOTICE 'Created 4 rooms with 10 participants and 13 messages';
END $$;

-- Verify the data
SELECT
    cr.name,
    cr.type,
    COUNT(DISTINCT cp.user_id) as participants,
    COUNT(cm.id) as messages
FROM chat_rooms cr
LEFT JOIN chat_participants cp ON cr.id = cp.room_id
LEFT JOIN chat_messages cm ON cr.id = cm.room_id
GROUP BY cr.id, cr.name, cr.type
ORDER BY cr.updated_at DESC;
