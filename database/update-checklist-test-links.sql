-- Cập nhật link_to từ /dashboard/tests sang /student/tests?type=... cho các task trắc nghiệm.
-- Chạy sau khi đã có redirect /dashboard/tests → /student/tests (để URL cũ vẫn hoạt động).

-- MBTI
UPDATE checklist_tasks
SET link_to = '/student/tests?type=mbti'
WHERE link_to = '/dashboard/tests'
  AND (title ILIKE '%MBTI%');

-- Grit Scale
UPDATE checklist_tasks
SET link_to = '/student/tests?type=grit'
WHERE link_to = '/dashboard/tests'
  AND (title ILIKE '%Grit%');

-- RIASEC / Holland
UPDATE checklist_tasks
SET link_to = '/student/tests?type=riasec'
WHERE link_to = '/dashboard/tests'
  AND (title ILIKE '%Holland%' OR title ILIKE '%RIASEC%');

-- Kiểm tra sau khi chạy:
-- SELECT id, title, link_to FROM checklist_tasks WHERE link_to LIKE '%tests%';
