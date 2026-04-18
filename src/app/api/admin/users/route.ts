import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET: list all users (with abuse info)
export async function GET() {
  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    username: users.username,
    apiKey: users.apiKey,
    balance: users.balance,
    oneTimeBalance: users.oneTimeBalance,
    createdAt: users.createdAt,
    banned: users.banned,
    banReason: users.banReason,
    abuseFlags: users.abuseFlags,
    abuseFlagCount: users.abuseFlagCount,
  }).from(users).orderBy(desc(users.createdAt)).limit(100);

  return NextResponse.json(allUsers);
}

// POST: ban or unban a user
export async function POST(req: Request) {
  try {
    const { userId, action, reason } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    if (action === 'ban') {
      await db.update(users).set({
        banned: true,
        banReason: reason || 'Manually banned by admin',
      }).where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: 'User banned' });
    }

    if (action === 'unban') {
      await db.update(users).set({
        banned: false,
        banReason: null,
        abuseFlags: null,
        abuseFlagCount: 0,
      }).where(eq(users.id, userId));
      return NextResponse.json({ success: true, message: 'User unbanned and flags cleared' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
