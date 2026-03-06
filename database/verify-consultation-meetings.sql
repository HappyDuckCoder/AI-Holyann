-- Kiểm tra cấu trúc bảng consultation_meetings
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'consultation_meetings'
ORDER BY
    ordinal_position;

-- Đếm số record hiện tại
SELECT COUNT(*) as total_meetings FROM consultation_meetings;
