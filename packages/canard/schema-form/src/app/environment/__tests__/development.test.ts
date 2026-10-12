import { afterEach, describe, expect, it, vi } from 'vitest';

/** Load a fresh copy of the module so the constant is evaluated under the stubbed env. */
const load = async () => {
  vi.resetModules();
  return (await import('../development')).DEVELOPMENT;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('DEVELOPMENT (rounds 189, 196)', () => {
  it('is false in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await load()).toBe(false);
  });

  it('is true outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect(await load()).toBe(true);
  });
});
