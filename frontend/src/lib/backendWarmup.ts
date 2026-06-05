import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Render free tier can take ~60s to wake; keep trying until the API responds. */
const WARMUP_DEADLINE_MS = 90_000;
const WARMUP_REQUEST_TIMEOUT_MS = 20_000;

let warmupPromise: Promise<boolean> | null = null;

async function pingHealth(): Promise<void> {
  await axios.get(`${API_BASE_URL}/health`, {
    timeout: WARMUP_REQUEST_TIMEOUT_MS,
  });
}

export async function warmBackend(): Promise<boolean> {
  const deadline = Date.now() + WARMUP_DEADLINE_MS;
  let attempt = 0;

  while (Date.now() < deadline) {
    try {
      await pingHealth();
      return true;
    } catch {
      attempt += 1;
      const delay = Math.min(2000 + attempt * 1500, 8000);
      await sleep(delay);
    }
  }

  return false;
}

/** Single shared warmup — safe to call from app mount and before scans. */
export function ensureBackendWarm(): Promise<boolean> {
  if (!warmupPromise) {
    warmupPromise = warmBackend().finally(() => {
      // Allow a later re-warm if the instance spun down again (after long idle).
      setTimeout(() => {
        warmupPromise = null;
      }, 5 * 60 * 1000);
    });
  }
  return warmupPromise;
}
