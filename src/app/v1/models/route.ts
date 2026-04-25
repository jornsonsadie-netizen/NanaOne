import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { models } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  try {
    // Fetch all enabled models from the database
    const dbModels = await db.select().from(models).where(eq(models.enabled, true));
    
    // De-duplicate model IDs for the response list
    const uniqueModelIds = Array.from(new Set(dbModels.map(m => m.id)));
    
    return NextResponse.json({
      object: "list",
      data: uniqueModelIds.map((id: string) => ({
        id: id,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "nanaone"
      }))
    }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Models Fetch Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500, headers: CORS_HEADERS });
  }
}
