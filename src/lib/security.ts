import { db } from './db';
import { ipBans } from './db/schema';
import { eq } from 'drizzle-orm';

export async function getAllBannedIPs(): Promise<string[]> {
  try {
    const bans = await db.select({ ip: ipBans.ip }).from(ipBans);
    return bans.map(b => b.ip);
  } catch (error) {
    console.error('Failed to fetch banned IPs:', error);
    return [];
  }
}

export async function banIP(ip: string, reason: string) {
  try {
    // Check if already banned to avoid unique constraint error
    const existing = await db.select().from(ipBans).where(eq(ipBans.ip, ip)).limit(1);
    if (existing.length > 0) return;

    await db.insert(ipBans).values({
      ip,
      reason,
    });
    console.log(`[SECURITY] Banned IP: ${ip} for ${reason}`);
  } catch (error) {
    console.error(`Failed to ban IP ${ip}:`, error);
  }
}

export async function unbanIP(ip: string) {
  try {
    await db.delete(ipBans).where(eq(ipBans.ip, ip));
    console.log(`[SECURITY] Unbanned IP: ${ip}`);
  } catch (error) {
    console.error(`Failed to unban IP ${ip}:`, error);
  }
}
