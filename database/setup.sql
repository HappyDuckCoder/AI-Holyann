-- =====================================================
-- HOLYANN EXPLORE - Database Setup Script
-- =====================================================
-- Run this in Supabase SQL Editor

-- Step 1: Create ENUM type for user roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('STUDENT', 'MENTOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create users table
CREATE TABLE IF NOT EXISTS users (
    id               UUID        DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    full_name        VARCHAR(100)                           NOT NULL,
    email            VARCHAR(255)                           NOT NULL UNIQUE,
    password_hash    VARCHAR(255),
    role             user_role   DEFAULT 'STUDENT'::user_role NOT NULL,
    auth_provider    VARCHAR(50) DEFAULT 'LOCAL'::character varying,
    auth_provider_id VARCHAR(255),
    avatar_url       TEXT,
    is_active        BOOLEAN     DEFAULT true,
    created_at       TIMESTAMP   DEFAULT now()
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies

-- Policy: Allow public to insert (for registration)
CREATE POLICY "Allow public registration" ON users
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT
    USING (auth.uid() = id OR is_active = true);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Step 6: Create function to handle updated_at timestamp (optional but recommended)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column if needed
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Create trigger for updated_at
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON users TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if enum exists
SELECT typname, enumlabel
FROM pg_type
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
WHERE typname = 'user_role'
ORDER BY enumlabel;

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- =====================================================
-- Test Insert (Run after setup to verify)
-- =====================================================

-- Test insert a sample user (will use this to verify everything works)
-- INSERT INTO users (full_name, email, password_hash, role, auth_provider)
-- VALUES ('Test User', 'test@example.com', 'test_hash', 'STUDENT', 'LOCAL')
-- ON CONFLICT (email) DO NOTHING
-- RETURNING *;

-- =====================================================
-- Cleanup (if needed to start fresh)
-- =====================================================

-- DROP POLICY IF EXISTS "Allow public registration" ON users;
-- DROP POLICY IF EXISTS "Users can read own data" ON users;
-- DROP POLICY IF EXISTS "Users can update own data" ON users;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TYPE IF EXISTS user_role CASCADE;

