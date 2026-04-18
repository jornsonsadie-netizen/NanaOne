import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found. Please sign up.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, apiKey: user[0].apiKey, username: user[0].username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
