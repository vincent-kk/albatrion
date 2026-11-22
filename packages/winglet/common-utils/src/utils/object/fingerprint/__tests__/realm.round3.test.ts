import { runInNewContext, runInThisContext } from 'node:vm';
import { expect, it } from 'vitest';
import { createSafeFingerprint } from '../utils/createSafeFingerprint';

it('round-3 safe keys compare realm-independent plain data and date values', () => {
  for (const expression of ['({a:1,b:[1,2]})','new Date(5)','/ab/i']) {
    const foreign: unknown = runInNewContext(expression);
    const local: unknown = runInThisContext(expression);
    expect(createSafeFingerprint(foreign)).toBe(createSafeFingerprint(local));
  }
});
