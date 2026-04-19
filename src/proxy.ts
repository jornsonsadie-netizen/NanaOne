import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache for banned IPs (populated at runtime, no DB calls in proxy)
let bannedIPsCache: Set<string> = new Set();

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
  '/.well-known/security.txt',
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
  'gptbot',
  'chatgpt-user',
  'claudebot',
  'anthropic-ai',
  'perplexitybot',
  'cohere-ai',
];

// In Next.js 16, the middleware function is exported as 'proxy'
export async function proxy(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  const url = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';

  // SKIP ALL CHECKS for auth routes — these must pass through cleanly
  if (url.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 0. Skip checks for static assets
  if (url.includes('.') || url.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 1. Check In-Memory Ban Cache (no DB call, just in-memory set)
  if (bannedIPsCache.has(ip)) {
    return new NextResponse('Access Denied: Your IP is blacklisted.', { status: 403 });
  }

  // 2. Honeypot Trap — ban in memory instantly
  if (HONEYPOT_PATHS.some(path => url.toLowerCase().includes(path.toLowerCase()))) {
    console.warn(`[SECURITY] Honeypot triggered by IP: ${ip} on path: ${url}`);
    bannedIPsCache.add(ip);
    return new NextResponse('Access Denied: Malicious activity detected.', { status: 403 });
  }

  // 3. Header & User-Agent Filtering
  if (!userAgent || BLOCKED_AGENTS.some(agent => userAgent.includes(agent))) {
    return new NextResponse('Access Denied: Scanner/Bot detected.', { status: 403 });
  }

  // 4. Payload Size Capping (1MB)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    return new NextResponse('Request Entity Too Large', { status: 413 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
