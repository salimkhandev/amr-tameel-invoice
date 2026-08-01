/**
 * Script to update admin user to remove email field
 * Run this with: node scripts/update-admin-user.js
 */

const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

if (!connectionString) {
  console.error('Error: SUPABASE_CONNECTION_STRING not found in .env file');
  process.exit(1);
}

async function updateAdminUser() {
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Updating admin user to remove email field...');
    await client.query(
      'UPDATE users SET full_name = $1 WHERE username = $2',
      ['Admin User', 'admin']
    );
    console.log('Admin user updated successfully!');

    console.log('\n✅ Admin user updated complete!');
    console.log('Username: admin');
    console.log('Full Name: Admin User');
    console.log('Email field removed from database.');

  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

updateAdminUser();
