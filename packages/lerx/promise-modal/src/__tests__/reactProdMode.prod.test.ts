import { describe, expect, it } from 'vitest';

/**
 * Canary for vitest.prod.config.ts: the whole suite must run against the
 * production build of React (see test:prod). This file is excluded from the
 * default (development) run by vite.config.ts.
 */
describe('production React canary', () => {
  it('테스트가 production NODE_ENV에서 실행되어야 함', () => {
    expect(process.env.NODE_ENV).toBe('production');
  });
});
