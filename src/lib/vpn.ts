// Simple in-memory cache for VPN check results
const vpnCache: Record<string, { isVPN: boolean; expires: number }> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function checkVPN(ip: string): Promise<boolean> {
  // 1. Check Cache
  const cached = vpnCache[ip];
  if (cached && Date.now() < cached.expires) {
    return cached.isVPN;
  }

  // 2. Handle Localhost/Internal
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown') {
    return false;
  }

  try {
    // 3. API Check (ip-api.com)
    // Fields: proxy (VPN/Proxy), hosting (Data Center/Hosting provider)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=proxy,hosting,status`);
    const data = await res.json();

    if (data.status !== 'success') {
      return false; // Fallback to allow if API fails
    }

    const isVPN = data.proxy === true || data.hosting === true;

    // 4. Update Cache
    vpnCache[ip] = {
      isVPN,
      expires: Date.now() + CACHE_DURATION
    };

    return isVPN;
  } catch (error) {
    console.error(`[VPN CHECK] Failed for IP ${ip}:`, error);
    return false; // Fail open to avoid blocking valid traffic if API is down
  }
}
