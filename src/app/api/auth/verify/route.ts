import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verificationCodes, users } from '@/lib/db/schema';
import { eq, and, gt, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { phone, code, username, type } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and Code are required' }, { status: 400 });
    }

    // Check code validity
    const validCodes = await db.select()
      .from(verificationCodes)
      .where(and(
        eq(verificationCodes.phone, phone),
        eq(verificationCodes.code, code),
        gt(verificationCodes.expiresAt, new Date())
      ))
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (validCodes.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Handle Signup or Login completion
    if (type === 'signup') {
      if (!username) return NextResponse.json({ error: 'Username required for signup' }, { status: 400 });
      
      const userId = uuidv4();
      const apiKey = `NanaOne-${uuidv4().replace(/-/g, '').slice(0, 16)}`;

      await db.insert(users).values({
        id: userId,
        username,
        phone,
        apiKey,
        balance: 20.0,
        oneTimeBalance: 0.0,
        lastReset: new Date(),
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, apiKey, username });
    } else {
      // Login
      const user = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
      if (user.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      return NextResponse.json({ success: true, apiKey: user[0].apiKey, username: user[0].username });
    }

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
