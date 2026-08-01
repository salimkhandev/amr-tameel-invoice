/**
 * Script to add is_seed column to users table and mark admin as seed
 * Run this with: node scripts/add-seed-column.js
 */

const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.SUPABASE_CONNECTION_STRING;

if (!connectionString) {
  console.error('Error: SUPABASE_CONNECTION_STRING not found in .env file');
  process.exit(1);
}

async function addSeedColumn() {
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Adding is_seed column to users table...');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT false');
    console.log('is_seed column added successfully!');

    console.log('Marking admin user as seed...');
    await client.query('UPDATE users SET is_seed = true WHERE username = $1', ['admin']);
    console.log('Admin user marked as seed successfully!');

    console.log('\n✅ Database schema updated successfully!');
    console.log('is_seed column added to users table.');
    console.log('Admin user marked as seed user.');

  } catch (error) {
    console.error('Error adding seed column:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

addSeedColumn();
