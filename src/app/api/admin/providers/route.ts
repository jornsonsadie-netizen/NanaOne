import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { providers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { refreshModels } from '@/lib/db/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const p = await db.select().from(providers);
  return NextResponse.json(p);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { id, name, baseUrl, apiKey, enabled, action } = body;

  try {
    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
      await db.delete(providers).where(eq(providers.id, id));
      return NextResponse.json({ success: true });
    }

    if (id) {
      // Update
      await db.update(providers).set({
        name,
        baseUrl,
        apiKey,
        enabled: enabled !== undefined ? enabled : true,
      }).where(eq(providers.id, id));
    } else {
      // Create
      await db.insert(providers).values({
        name,
        baseUrl,
        apiKey,
        enabled: enabled !== undefined ? enabled : true,
      });
    }

    // Optional: Auto-refresh models when a provider is added/updated
    // await refreshModels();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Provider Action Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
