import axios from 'axios';

const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.link', 'is.gd', 'buff.ly', 'adf.ly'
]);

export type RedirectTraceResult = {
  initialUrl: string;
  finalUrl: string;
  finalDomain: string;
  hops: number;
  chain: string[];
  domainChanged: boolean;
  usedShortener: boolean;
};

export async function traceRedirects(url: string, maxHops = 6, timeout = 5000): Promise<RedirectTraceResult> {
  const chain: string[] = [];
  let current = url;
  let hops = 0;
  let finalUrl = url;

  const client = axios.create({
    timeout,
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400,
    headers: { 'User-Agent': 'CatchersAI-RedirectTracer/1.0' },
  });

  try {
    while (hops < maxHops) {
      hops += 1;
      try {
        const resp = await client.head(current);
        const status = resp.status;
        const location = resp.headers.location;
        chain.push(current);

        if (location && (status >= 300 && status < 400)) {
          // Resolve relative locations
          try {
            const next = new URL(location, current).toString();
            current = next;
            continue;
          } catch {
            break;
          }
        } else {
          finalUrl = current;
          break;
        }
      } catch (err: any) {
        // Some servers reject HEAD; try GET as fallback
        try {
          const resp = await client.get(current);
          const status = resp.status;
          const location = resp.headers.location;
          chain.push(current);

          if (location && (status >= 300 && status < 400)) {
            const next = new URL(location, current).toString();
            current = next;
            continue;
          } else {
            finalUrl = current;
            break;
          }
        } catch {
          // Can't continue, stop tracing
          finalUrl = current;
          break;
        }
      }
    }
  } catch (outerErr) {
    // Ensure we return a best-effort result
  }

  // If chain empty, include original url
  if (chain.length === 0) chain.push(url);

  const finalDomain = (() => {
    try {
      return new URL(finalUrl).hostname;
    } catch {
      return '';
    }
  })();

  const initialDomain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  })();

  const domainChanged = initialDomain !== finalDomain;

  const usedShortener = chain.some((u) => {
    try {
      const host = new URL(u).hostname.replace(/^www\./, '').toLowerCase();
      return SHORTENER_DOMAINS.has(host);
    } catch {
      return false;
    }
  });

  return {
    initialUrl: url,
    finalUrl,
    finalDomain,
    hops: Math.min(hops, maxHops),
    chain,
    domainChanged,
    usedShortener,
  };
}
