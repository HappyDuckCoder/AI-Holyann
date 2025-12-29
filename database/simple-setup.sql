-- SIMPLE SETUP WITHOUT RLS (For quick testing)
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing if any
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Step 2: Create ENUM
CREATE TYPE user_role AS ENUM ('STUDENT', 'MENTOR', 'ADMIN');

-- Step 3: Create table WITHOUT RLS
CREATE TABLE users
(
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name        VARCHAR(100)                             NOT NULL,
    email            VARCHAR(255)                             NOT NULL UNIQUE,
    password_hash    VARCHAR(255),
    role             user_role   DEFAULT 'STUDENT'::user_role NOT NULL,
    auth_provider    VARCHAR(50) DEFAULT 'LOCAL',
    auth_provider_id VARCHAR(255),
    avatar_url       TEXT,
    is_active        BOOLEAN     DEFAULT true,
    created_at       TIMESTAMP   DEFAULT now()
);

-- Step 4: Create indexes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- Step 5: DISABLE RLS for testing
ALTER TABLE users
    DISABLE ROW LEVEL SECURITY;

-- Step 6: Verify
SELECT *
FROM users;

-- Expected: Empty table, no errors

