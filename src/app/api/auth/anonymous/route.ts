import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const userId = uuidv4().slice(0, 8); // Short ID for anonymous user
    const username = `User_${userId}`;
    const apiKey = `NanaOne-${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    await db.insert(users).values({
      id: userId,
      username,
      apiKey,
      balance: 20.0, // Daily starting balance
      oneTimeBalance: 0.0,
      lastReset: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, apiKey, username, id: userId });
  } catch (error) {
    console.error('Anonymous provisioning error:', error);
    return NextResponse.json({ error: 'Failed to provision access' }, { status: 500 });
  }
}
