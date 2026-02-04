-- Mentor Tasks Table Migration
-- This migration creates a table to manage tasks/deadlines for students

-- ==================== CREATE ENUM FOR TASK STATUS ====================
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'COMPLETED');

-- ==================== CREATE MENTOR_TASKS TABLE ====================
CREATE TABLE "mentor_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "mentor_id" UUID NOT NULL,
    "task_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(6),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_tasks_pkey" PRIMARY KEY ("id")
);

-- ==================== CREATE INDEXES ====================
CREATE INDEX "mentor_tasks_student_id_idx" ON "mentor_tasks"("student_id");
CREATE INDEX "mentor_tasks_mentor_id_idx" ON "mentor_tasks"("mentor_id");
CREATE INDEX "mentor_tasks_status_idx" ON "mentor_tasks"("status");
CREATE INDEX "mentor_tasks_deadline_idx" ON "mentor_tasks"("deadline");

-- ==================== ADD FOREIGN KEY CONSTRAINTS ====================
ALTER TABLE "mentor_tasks" 
ADD CONSTRAINT "mentor_tasks_student_id_fkey" 
FOREIGN KEY ("student_id") 
REFERENCES "students"("user_id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE "mentor_tasks" 
ADD CONSTRAINT "mentor_tasks_mentor_id_fkey" 
FOREIGN KEY ("mentor_id") 
REFERENCES "mentors"("user_id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- ==================== TRIGGER FOR UPDATED_AT ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mentor_tasks_updated_at 
BEFORE UPDATE ON "mentor_tasks" 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (OPTIONAL) ====================
-- Uncomment to insert sample tasks for testing

/*
INSERT INTO "mentor_tasks" ("student_id", "mentor_id", "task_name", "description", "deadline", "status") VALUES
(
    (SELECT user_id FROM students LIMIT 1),
    (SELECT user_id FROM mentors LIMIT 1),
    'Hoàn thiện Personal Statement',
    'Draft cuối cùng trước khi nộp',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    'IN_REVIEW'
),
(
    (SELECT user_id FROM students LIMIT 1),
    (SELECT user_id FROM mentors LIMIT 1),
    'Nộp đơn Common App',
    'Hoàn tất hồ sơ trên Common Application',
    CURRENT_TIMESTAMP + INTERVAL '14 days',
    'PENDING'
);
*/

-- ==================== ROLLBACK (IF NEEDED) ====================
-- Run these commands to undo the migration:
/*
DROP TRIGGER IF EXISTS update_mentor_tasks_updated_at ON "mentor_tasks";
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS "mentor_tasks";
DROP TYPE IF EXISTS "TaskStatus";
*/
