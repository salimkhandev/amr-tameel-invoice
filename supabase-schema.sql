-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  is_seed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - you should change this)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (username, password_hash, email, full_name, role)
VALUES (
  'admin',
  '$2a$10$YourBcryptHashHereReplaceThis',
  'admin@example.com',
  'Admin User',
  'admin'
) ON CONFLICT (username) DO NOTHING;

-- Create health check table for keep-alive monitoring
CREATE TABLE IF NOT EXISTS health_checks (
  id SERIAL PRIMARY KEY,
  check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'ok'
);

-- Function to clean up old health checks (keep only last 100)
CREATE OR REPLACE FUNCTION cleanup_old_health_checks()
RETURNS void AS $$
BEGIN
  DELETE FROM health_checks
  WHERE id NOT IN (
    SELECT id FROM health_checks
    ORDER BY check_time DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to log health checks
CREATE OR REPLACE FUNCTION log_health_check()
RETURNS void AS $$
BEGIN
  INSERT INTO health_checks (status) VALUES ('ok');
  PERFORM cleanup_old_health_checks();
END;
$$ LANGUAGE plpgsql;
