// src/utils/fetchSingleton.ts
const inflight = new Map<string, Promise<unknown>>();
const cache = new Map<string, { json: unknown; timestamp: number }>();
const CACHE_TTL = 15_000; // 15 seconds

export async function fetchSingleton<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const now = Date.now();

  const cached = cache.get(url);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.json as T;
  }

  if (inflight.has(url)) return inflight.get(url)! as Promise<T>;

  const req = (async (): Promise<T> => {
    const res = await fetch(url, options);

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const json = (await res.json()) as T;
    cache.set(url, { json, timestamp: Date.now() });
    return json;
  })();

  inflight.set(url, req);

  try {
    return await req;
  } finally {
    inflight.delete(url);
  }
}
