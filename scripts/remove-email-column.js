/**
 * Script to remove email column from users table
 * Run this with: node scripts/remove-email-column.js
 */

const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

if (!connectionString) {
  console.error('Error: SUPABASE_CONNECTION_STRING not found in .env file');
  process.exit(1);
}

async function removeEmailColumn() {
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Removing email column from users table...');
    await client.query('ALTER TABLE users DROP COLUMN IF EXISTS email');
    console.log('Email column removed successfully!');

    console.log('\n✅ Database schema updated successfully!');
    console.log('Email column has been removed from the users table.');

  } catch (error) {
    console.error('Error removing email column:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

removeEmailColumn();
