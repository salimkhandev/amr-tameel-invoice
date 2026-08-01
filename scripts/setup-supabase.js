/**
 * Script to set up Supabase database schema
 * Run this with: node scripts/setup-supabase.js
 */

const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

if (!connectionString) {
  console.error('Error: SUPABASE_CONNECTION_STRING not found in .env file');
  process.exit(1);
}

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
`;

async function setupDatabase() {
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Setting up database schema...');
    await client.query(schema);
    console.log('Database schema created successfully!');

    console.log('\nNext steps:');
    console.log('1. Generate a bcrypt hash for your admin password');
    console.log('2. Insert the admin user into the database');
    console.log('3. Update your .env file with the correct SUPABASE_ANON_KEY');
    console.log('4. Add GitHub secrets for the workflow');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

setupDatabase();
