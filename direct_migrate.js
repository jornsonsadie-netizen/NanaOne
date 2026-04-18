const { neon } = require('./node_modules/@neondatabase/serverless/index.js');

const url = "postgresql://neondb_owner:npg_2udzYD8xKeXR@ep-calm-art-amez82zx-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(url);

async function run() {
  try {
    console.log('Attempting to add columns...');
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS context_limit INTEGER DEFAULT 16000`;
    await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS max_output_tokens INTEGER DEFAULT 4000`;
    console.log('Columns verified/added.');
    
    // Check if ID 1 exists
    const row = await sql`SELECT * FROM settings WHERE id = 1`;
    if (row.length === 0) {
      console.log('ID 1 missing. Inserting default settings...');
      await sql`INSERT INTO settings (id, upstream_endpoint, upstream_key, admin_password, context_limit, max_output_tokens) 
                VALUES (1, 'https://api.openai.com/v1', '', 'enyapeakshit', 16000, 4000)`;
    } else {
      console.log('Settings row exists.');
    }
    
    console.log('Database manual sync complete.');
  } catch (e) {
    console.error('Update failed:', e);
  } finally {
    process.exit(0);
  }
}
run();
