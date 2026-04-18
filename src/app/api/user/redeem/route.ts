import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, redeemCodes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { code, apiKey } = await req.json();
    
    if (!code || !apiKey) {
      return NextResponse.json({ error: 'Code and API Key are required' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    console.log(`[REDEEM] Attempt for code ${normalizedCode} (apiKey: ${apiKey?.slice(0, 8)}...)`);

    const user = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1);
    if (user.length === 0) {
      console.warn(`[REDEEM] User not found for API Key`);
      return NextResponse.json({ error: 'User session invalid. Please re-login.', code: 'USER_NOT_FOUND' }, { status: 401 });
    }

    const redeemCode = await db.select().from(redeemCodes).where(eq(redeemCodes.code, normalizedCode)).limit(1);
    
    if (redeemCode.length === 0) {
      console.warn(`[REDEEM] Invalid code: ${normalizedCode}`);
      return NextResponse.json({ error: 'This redemption code does not exist', code: 'INVALID_CODE' }, { status: 400 });
    }

    if (redeemCode[0].isUsed) {
      return NextResponse.json({ error: 'Code already used' }, { status: 400 });
    }

    // Perform updates sequentially if transaction is failing
    try {
      await db.update(redeemCodes)
        .set({ isUsed: true, usedBy: user[0].id })
        .where(eq(redeemCodes.code, normalizedCode));

      await db.update(users)
        .set({ oneTimeBalance: (user[0].oneTimeBalance || 0) + redeemCode[0].amount })
        .where(eq(users.id, user[0].id));

    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    return NextResponse.json({ success: true, amount: redeemCode[0].amount });
  } catch (error) {
    console.error('General Redeem error:', error);
    return NextResponse.json({ error: 'Redemption failed unexpectedly' }, { status: 500 });
  }
}
