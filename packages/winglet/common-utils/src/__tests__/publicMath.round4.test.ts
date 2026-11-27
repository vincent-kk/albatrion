import { describe, expect, it, vi } from 'vitest';

import { fromBase } from '../index';

const loadFreshFactorial = async () => {
  vi.resetModules();
  const module = await import('../index');
  return module.factorial;
};

describe('fromBase rejects characters that are not base-36 digits', () => {
  it.each([
    ['ı', 36], // LATIN SMALL LETTER DOTLESS I uppercases to "I"
    ['ſ', 36], // LATIN SMALL LETTER LONG S uppercases to "S"
    ['ß', 36], // LATIN SMALL LETTER SHARP S uppercases to "SS"
    ['ﬀ', 16], // LATIN SMALL LIGATURE FF uppercases to "FF"
  ])('fromBase(%j, %i) throws an invalid-digit error', (value, base) => {
    let outcome: string;
    try {
      outcome = `returned ${fromBase(value, base)}`;
    } catch (error) {
      outcome = `threw ${error instanceof Error ? error.message : String(error)}`;
    }
    expect(outcome).toMatch(/^threw Invalid digit/);
  });

  it('rejects a sign with no digits and preserves negative zero', () => {
    expect(() => fromBase('-', 36)).toThrow();
    expect(Object.is(fromBase('-0', 36), -0)).toBe(true);
  });
});

describe('factorial does not depend on which values were computed before', () => {
  it('every n from 20 to 170 gives one value whatever smaller n was computed first', async () => {
    const mismatches: string[] = [];
    for (let n = 20; n <= 170 && mismatches.length < 5; n++) {
      const fresh = await loadFreshFactorial();
      const alone = fresh(n);
      const warmed = await loadFreshFactorial();
      warmed(n - 1);
      const after = warmed(n);
      if (after !== alone) mismatches.push(`${n}: ${alone} vs ${after}`);
    }
    expect(mismatches).toEqual([]);
  });
});
