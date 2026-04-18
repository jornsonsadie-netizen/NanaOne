const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');
const dotenv = require('dotenv');
const path = require('path');

// Load .env explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

async function migrate() {
  console.log('Starting manual migration...');
  try {
    // Add columns if they don't exist
    await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS context_limit INTEGER DEFAULT 16000`);
    console.log('Added context_limit (if missing)');
    
    await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS max_output_tokens INTEGER DEFAULT 4000`);
    console.log('Added max_output_tokens (if missing)');
    
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
