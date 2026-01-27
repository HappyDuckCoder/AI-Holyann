-- Create password_reset_otps table for storing OTP codes
CREATE TABLE IF NOT EXISTS password_reset_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_email_otp UNIQUE (email, otp)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at ON password_reset_otps(expires_at);

-- Add RLS policies
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Allow insert from API (service role)
CREATE POLICY "Allow service role to manage OTPs" ON password_reset_otps
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create cleanup function to delete expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_otps
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to cleanup expired OTPs every hour
-- (This requires pg_cron extension - uncomment if you have it)
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps()');

COMMENT ON TABLE password_reset_otps IS 'Stores OTP codes for password reset functionality';
COMMENT ON COLUMN password_reset_otps.email IS 'User email address';
COMMENT ON COLUMN password_reset_otps.otp IS '6-digit OTP code';
COMMENT ON COLUMN password_reset_otps.expires_at IS 'OTP expiration timestamp';
COMMENT ON COLUMN password_reset_otps.created_at IS 'When the OTP was generated';
