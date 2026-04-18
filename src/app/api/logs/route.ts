import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { curationLogs } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await db
      .select()
      .from(curationLogs)
      .orderBy(desc(curationLogs.createdAt))
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
