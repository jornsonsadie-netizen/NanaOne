import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ipBans } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { unbanIP } from '@/lib/security';

export async function GET() {
  try {
    const allBans = await db.select().from(ipBans).orderBy(desc(ipBans.createdAt));
    return NextResponse.json(allBans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch IP bans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { ip, action } = await req.json();
    if (!ip || action !== 'unban') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await unbanIP(ip);
    return NextResponse.json({ success: true, message: `IP ${ip} unbanned` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unban IP' }, { status: 500 });
  }
}
