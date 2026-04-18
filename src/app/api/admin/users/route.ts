import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, accounts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { banGithubId, unbanGithubId } from '@/lib/security';

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
      const banReason = reason || 'Manually banned by admin';
      await db.update(users).set({
        banned: true,
        banReason: banReason,
        apiKey: null, // Revoke API key
      }).where(eq(users.id, userId));

      // Also ban associated GitHub account if exists
      const linkedAccount = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1);
      if (linkedAccount[0]?.provider === 'github') {
        await banGithubId(linkedAccount[0].providerAccountId, banReason);
      }

      return NextResponse.json({ success: true, message: 'User banned, API key revoked, and GitHub blacklisted' });
    }

    if (action === 'unban') {
      const { v4: uuidv4 } = require('uuid');
      const newApiKey = `NanaOne-${uuidv4().replace(/-/g, '').slice(0, 32)}`;
      
      await db.update(users).set({
        banned: false,
        banReason: null,
        abuseFlags: null,
        abuseFlagCount: 0,
        apiKey: newApiKey, // Restore access with a new key
      }).where(eq(users.id, userId));

      // Also unban associated GitHub account
      const linkedAccount = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1);
      if (linkedAccount[0]?.provider === 'github') {
        await unbanGithubId(linkedAccount[0].providerAccountId);
      }

      return NextResponse.json({ success: true, message: 'User unbanned, flags cleared, and GitHub whitelist updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
