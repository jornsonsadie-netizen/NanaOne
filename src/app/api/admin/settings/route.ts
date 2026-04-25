import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings, models } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { refreshModels } from '@/lib/db/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return NextResponse.json(s[0] || {});
}

export async function POST(req: Request) {
  const body = await req.json();
  const { endpoint, key, contextLimit, maxOutputTokens, refreshOnly } = body;

  if (refreshOnly) {
    await refreshModels();
    return NextResponse.json({ success: true });
  }

  await db.update(settings).set({
    ...(endpoint && { upstreamEndpoint: endpoint }),
    ...(key && { upstreamKey: key }),
    contextLimit: Number(contextLimit) || 16000,
    maxOutputTokens: Number(maxOutputTokens) || 4000,
  }).where(eq(settings.id, 1));

  // Refresh models after updating global settings if requested
  await refreshModels();

  return NextResponse.json({ success: true });
}
