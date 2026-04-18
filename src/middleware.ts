import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllBannedIPs, banIP } from '@/lib/security';

// In-memory cache for banned IPs
let bannedIPsCache: Set<string> = new Set();
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Sensitive paths that trigger a honeypot ban
const HONEYPOT_PATHS = [
  '/.env',
  '/.git',
  '/wp-admin',
  '/wp-login.php',
  '/xmlrpc.php',
  '/config.php',
  '/admin.php',
  '/.aws',
  '/.ssh',
  '/id_rsa',
  '/.well-known/security.txt', // Sometimes used for scanning
];

// Blocked User-Agents (common scanners)
const BLOCKED_AGENTS = [
  'sqlmap',
  'nuclei',
  'nikto',
  'nmap',
  'masscan',
  'zgrab',
  'censys',
];

async function updateCache() {
  const now = Date.now();
  if (now - lastCacheUpdate > CACHE_TTL) {
    const IPs = await getAllBannedIPs();
    bannedIPsCache = new Set(IPs);
    lastCacheUpdate = now;
    console.log(`[SECURITY] Synced ${bannedIPsCache.size} banned IPs to in-memory cache.`);
  }
}

export async function middleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const url = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';

  // 1. Check In-Memory Ban Cache
  await updateCache();
  if (bannedIPsCache.has(ip)) {
    return new NextResponse('Access Denied: Your IP is blacklisted.', { status: 403 });
  }

  // 2. Honeypot Trap
  if (HONEYPOT_PATHS.some(path => url.toLowerCase().includes(path.toLowerCase()))) {
    console.warn(`[SECURITY] Honeypot triggered by IP: ${ip} on path: ${url}`);
    await banIP(ip, `Honeypot triggered: ${url}`);
    bannedIPsCache.add(ip); // Instant local ban
    return new NextResponse('Access Denied: Malicious activity detected.', { status: 403 });
  }

  // 3. Header & User-Agent Filtering
  if (!userAgent || BLOCKED_AGENTS.some(agent => userAgent.includes(agent))) {
    return new NextResponse('Access Denied: Scanner/Bot detected.', { status: 403 });
  }

  // 4. Payload Size Capping (optional but requested)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB
    return new NextResponse('Request Entity Too Large', { status: 413 });
  }

  return NextResponse.next();
}

// Ensure middleware runs on all paths
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
