import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redeemCodes } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const codes = await db.select().from(redeemCodes).orderBy(desc(redeemCodes.createdAt)).limit(50);
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  try {
    const { amount, customCode } = await req.json();
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const code = customCode ? customCode.toUpperCase() : `NANA-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    
    // Check if code already exists
    const existing = await db.select().from(redeemCodes).where(eq(redeemCodes.code, code)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
    }

    await db.insert(redeemCodes).values({
      code,
      amount: parseFloat(amount),
      isUsed: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ code, amount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create code' }, { status: 500 });
  }
}
