const { neon } = require('./node_modules/@neondatabase/serverless/index.js');

const url = "postgresql://neondb_owner:npg_2udzYD8xKeXR@ep-calm-art-amez82zx-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(url);

async function run() {
  try {
    console.log('Adding abuse detection columns to users table...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE`;
    console.log('  + banned');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`;
    console.log('  + ban_reason');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS abuse_flags TEXT`;
    console.log('  + abuse_flags');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS abuse_flag_count INTEGER DEFAULT 0`;
    console.log('  + abuse_flag_count');
    console.log('Migration complete.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    process.exit(0);
  }
}
run();
