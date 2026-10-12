import { afterEach, describe, expect, it, vi } from 'vitest';

/** Load a fresh copy of the module so its cached verdict starts empty. */
const load = async () => {
  vi.resetModules();
  return (await import('../isDevelopment')).isDevelopment;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isDevelopment (round 183, round 189)', () => {
  it('reads the environment at the first call, not at module load', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const isDevelopment = await load();
    vi.stubEnv('NODE_ENV', 'production');
    expect(isDevelopment()).toBe(false);
  });

  it('is true outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect((await load())()).toBe(true);
  });

  it('caches the first verdict for every later call', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const isDevelopment = await load();
    expect(isDevelopment()).toBe(false);
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevelopment()).toBe(false);
  });
});
