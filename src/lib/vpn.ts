// Simple in-memory cache for VPN check results
const vpnCache: Record<string, { isVPN: boolean; expires: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (short so users recover fast after disabling VPN)

interface IPAPIResponse {
  status: 'success' | 'fail';
  proxy?: boolean;
  hosting?: boolean;
  query?: string;
  message?: string;
}

export async function checkVPN(ip: string): Promise<boolean> {
  // 1. Check Cache
  const cached = vpnCache[ip];
  if (cached && Date.now() < cached.expires) {
    return cached.isVPN;
  }

  // 2. Handle Localhost/Internal/Unknown
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown' || ip === '') {
    return false;
  }

  try {
    // 3. API Check (ip-api.com)
    // ONLY check proxy flag. "hosting" causes false positives on Starlink, T-Mobile, etc.
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=proxy,status`);
    const data = await res.json() as IPAPIResponse;

    if (data.status !== 'success') {
      return false; // Fail open if API fails
    }

    // Only flag actual proxies/VPNs, NOT hosting providers
    const isVPN = data.proxy === true;

    // 4. Update Cache
    vpnCache[ip] = {
      isVPN,
      expires: Date.now() + CACHE_DURATION
    };

    return isVPN;
  } catch (error) {
    console.error(`[VPN CHECK] Failed for IP ${ip}:`, error);
    return false; // Fail open
  }
}

// Allow manually clearing cache for an IP (used when user says they disabled VPN)
export function clearVPNCache(ip: string) {
  delete vpnCache[ip];
}
