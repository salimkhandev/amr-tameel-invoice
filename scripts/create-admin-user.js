/**
 * Script to create admin user in Supabase
 * Run this with: node scripts/create-admin-user.js
 */

const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

if (!connectionString) {
  console.error('Error: SUPABASE_CONNECTION_STRING not found in .env file');
  process.exit(1);
}

async function createAdminUser() {
  const client = new Client({
    connectionString: connectionString
  });

  // Default admin credentials
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const adminFullName = 'Admin User';

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    // Generate bcrypt hash
    console.log('Generating bcrypt hash for password...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    console.log('Password hash generated successfully!');

    // Check if admin user already exists
    console.log('Checking if admin user already exists...');
    const checkResult = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [adminUsername]
    );

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists. Updating password...');
      await client.query(
        'UPDATE users SET password_hash = $1, full_name = $2 WHERE username = $3',
        [passwordHash, adminFullName, adminUsername]
      );
      console.log('Admin user updated successfully!');
    } else {
      console.log('Creating new admin user...');
      await client.query(
        'INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES ($1, $2, $3, $4, $5)',
        [adminUsername, passwordHash, adminFullName, 'admin', true]
      );
      console.log('Admin user created successfully!');
    }

    console.log('\n✅ Admin user setup complete!');
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    console.log('⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

createAdminUser();
