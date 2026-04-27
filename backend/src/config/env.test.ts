import { describe, expect, it, vi } from 'vitest';

describe('config/env', () => {
  it('parses comma-separated CORS_ORIGIN into a list', async () => {
    vi.resetModules();
    process.env.CORS_ORIGIN = 'http://localhost:8080, https://example.com';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/catchers-ai';

    const mod = await import('./env.js');
    expect(mod.config.corsOrigins).toEqual(['http://localhost:8080', 'https://example.com']);
  });

  it('rejects wildcard CORS_ORIGIN when credentials are enabled', async () => {
    vi.resetModules();
    process.env.CORS_ORIGIN = '*';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/catchers-ai';

    await expect(import('./env.js')).rejects.toThrow(/CORS_ORIGIN cannot include "\*"/);
  });
});

