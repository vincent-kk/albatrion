import { describe, expect, it } from 'vitest';
import { combination } from '../combination';
import { fromBase } from '../fromBase';

describe('round-2 common-utils 4: safe integer combinations', () => {
  it('matches exact integer arithmetic while the result is safe', () => {
    for (let n = 0; n <= 70; n++) {
      let exact = 1n;
      for (let r = 0; r <= n; r++) {
        if (r) exact = exact * BigInt(n - r + 1) / BigInt(r);
        if (exact <= BigInt(Number.MAX_SAFE_INTEGER)) expect(combination(n, r)).toBe(Number(exact));
      }
    }
  });
});
describe('round-2 common-utils 8: a sign requires digits', () => {
  it('rejects a lone minus as it rejects an empty number', () => {
    expect(() => fromBase('', 10)).toThrow();
    expect(() => fromBase('-', 10)).toThrow();
  });
});
