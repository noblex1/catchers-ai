import whois from 'whois-json';

type WhoisCacheEntry = {
  data: any;
  expiresAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const cache = new Map<string, WhoisCacheEntry>();

const safeParseDate = (value: any): Date | null => {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
};

export async function lookupWhois(domain: string): Promise<any> {
  const key = domain.toLowerCase();

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // Fallback structure
  const result: any = {
    registrar: null,
    creationDate: null,
    updatedDate: null,
    expirationDate: null,
    domainAgeDays: null,
    recentlyRegistered: false,
    recentlyUpdated: false,
    raw: null,
  };

  try {
    const raw = (await whois(domain, { follow: 0, timeout: 10000 })) as Record<string, unknown>;
    result.raw = raw;

    // Common fields (WHOIS responses use varying property names)
    const creation = raw.creationDate ?? raw.created ?? raw.registered;
    const updated = raw.updatedDate ?? raw.updated;
    const expiry = raw.expirationDate ?? raw.expires ?? raw['Registry Expiry Date'];
    const registrar = raw.registrar ?? raw['Registrar'] ?? raw['registrar'];

    const creationDate = safeParseDate(creation);
    const updatedDate = safeParseDate(updated);
    const expirationDate = safeParseDate(expiry);

    result.registrar = registrar || null;
    result.creationDate = creationDate ? creationDate.toISOString() : null;
    result.updatedDate = updatedDate ? updatedDate.toISOString() : null;
    result.expirationDate = expirationDate ? expirationDate.toISOString() : null;

    if (creationDate) {
      const ageDays = Math.floor((Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
      result.domainAgeDays = ageDays;
      result.recentlyRegistered = ageDays < 30;
    }

    if (updatedDate) {
      const updatedDays = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
      result.recentlyUpdated = updatedDays < 30;
    }

    // Cache
    cache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  } catch (error) {
    // Non-fatal - return partial result
    result.raw = { error: String(error) };
  }

  return result;
}

export function clearWhoisCache(): void {
  cache.clear();
}
