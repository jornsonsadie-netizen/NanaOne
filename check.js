const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_2udzYD8xKeXR@ep-calm-art-amez82zx-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
async function check() {
  const p = await sql`SELECT * FROM providers`;
  const m = await sql`SELECT * FROM models`;
  console.log('Providers:', p);
  console.log('Models len:', m.length);
  if(m.length > 0) {
     console.log('Models top 3:', m.slice(0,3));
  }
  process.exit(0);
}
check();
