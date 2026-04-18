import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  // Optional: Check API Key for models endpoint if desired, but many UIs expect it
  const s = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  if (s.length === 0) {
    return NextResponse.json({ error: 'Gateway settings not initialized' }, { status: 500, headers: CORS_HEADERS });
  }

  try {
    const response = await axios.get(`${s[0].upstreamEndpoint}/models`, {
      headers: {
        'Authorization': `Bearer ${s[0].upstreamKey}`,
      },
    });
    
    // Ensure the response matches OpenAI "list" format
    const modelsData = response.data.data || [];
    
    return NextResponse.json({
      object: "list",
      data: modelsData.map((m: any) => ({
        id: m.id,
        object: "model",
        created: m.created || Math.floor(Date.now() / 1000),
        owned_by: m.owned_by || "nanaone"
      }))
    }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Models Fetch Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500, headers: CORS_HEADERS });
  }
}
