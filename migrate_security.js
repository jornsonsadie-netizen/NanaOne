const { neon } = require('./node_modules/@neondatabase/serverless/index.js');

const url = "postgresql://neondb_owner:npg_2udzYD8xKeXR@ep-calm-art-amez82zx-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(url);

async function run() {
  try {
    console.log('Running security migration...');

    // 1. Create banned_github_ids table
    await sql`CREATE TABLE IF NOT EXISTS banned_github_ids (
      github_id TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    console.log('  + banned_github_ids table created');

    // 2. Create ip_bans table
    await sql`CREATE TABLE IF NOT EXISTS ip_bans (
      ip TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    console.log('  + ip_bans table created');

    // 3. Add locked_ip column to users
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_ip TEXT`;
    console.log('  + locked_ip column added to users');

    console.log('Security migration complete!');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    process.exit(0);
  }
}
run();
