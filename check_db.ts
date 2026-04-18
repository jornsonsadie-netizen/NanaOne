import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings'
    `);
    console.log('Columns in settings table:', result.rows.map(r => r.column_name));
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit();
  }
}

checkSchema();
