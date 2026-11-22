import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

import {
  Murmur3,
  combination,
  convertMsFromDuration,
  fromBase,
  gcd,
  getTrackableHandler,
  isEmpty,
  lcm,
  removeUndefined,
  round,
  sortObjectKeys,
  toBase,
} from '@/common-utils/index';

describe('object writes with reserved keys', () => {
  it('removeUndefined keeps an own __proto__ key as data and does not replace the prototype', () => {
    const input = JSON.parse('{"__proto__":{"polluted":true},"a":1}');
    const result = removeUndefined(input) as Record<string, unknown>;
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.keys(result).sort()).toEqual(['__proto__', 'a']);
    expect((result as any).polluted).toBeUndefined();
  });

  it('sortObjectKeys keeps an own __proto__ key as data and does not replace the prototype', () => {
    const input = JSON.parse('{"__proto__":{"polluted":true},"b":2}');
    const result = sortObjectKeys(input, ['b', '__proto__']);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.keys(result)).toEqual(['b', '__proto__']);
    expect((result as any).polluted).toBeUndefined();
  });
});

describe('Murmur3 incremental hashing', () => {
  it('a non-Latin-1 string hashed in two calls equals the one-shot hash', () => {
    const text = '가나다라마바사아';
    const oneShot = new Murmur3().hash(text).result();
    const incremental = new Murmur3().hash(text.slice(0, 3)).hash(text.slice(3)).result();
    expect(incremental).toBe(oneShot);
  });

  it('control: an ASCII string hashed in two calls equals the one-shot hash', () => {
    const text = 'abcdefgh';
    const oneShot = new Murmur3().hash(text).result();
    const incremental = new Murmur3().hash(text.slice(0, 3)).hash(text.slice(3)).result();
    expect(incremental).toBe(oneShot);
  });
});

describe('getTrackableHandler cleanup', () => {
  it('a subscriber that throws on the start notification does not leave pending stuck', async () => {
    let calls = 0;
    const handler = getTrackableHandler(async () => {
      calls++;
    });
    let shouldThrow = true;
    handler.subscribe(() => {
      if (shouldThrow) {
        shouldThrow = false;
        throw new Error('listener failure');
      }
    });
    await expect(handler()).rejects.toThrow('listener failure');
    expect(handler.pending).toBe(false);
    await handler();
    expect(calls).toBe(1);
  });

  it('with preventConcurrent false, pending stays true while another call is running', async () => {
    const resolvers: Array<() => void> = [];
    const handler = getTrackableHandler(
      () => new Promise<void>((resolve) => resolvers.push(resolve)),
      { preventConcurrent: false },
    );
    const first = handler();
    const second = handler();
    resolvers[0]();
    await first;
    // the second call is still running
    expect(handler.pending).toBe(true);
    resolvers[1]();
    await second;
    expect(handler.pending).toBe(false);
  });
});

describe('convertMsFromDuration fallback', () => {
  it('returns 0 for null and undefined instead of throwing', () => {
    expect(() => convertMsFromDuration(null as unknown as string)).not.toThrow();
    expect(convertMsFromDuration(undefined as unknown as string)).toBe(0);
  });

  it('handles a long whitespace run without pathological time', () => {
    const started = performance.now();
    expect(convertMsFromDuration('1' + ' '.repeat(200_000) + 'x')).toBe(0);
    expect(convertMsFromDuration(' '.repeat(200_000) + 'x')).toBe(0);
    expect(performance.now() - started).toBeLessThan(500);
  });
});

describe('isEmpty with collections from another realm', () => {
  it('a populated Map and Set from another realm are not empty', () => {
    const map = runInNewContext('new Map([[1, 1]])');
    const set = runInNewContext('new Set([1])');
    expect(isEmpty(map)).toBe(false);
    expect(isEmpty(set)).toBe(false);
  });
});

describe('math numeric edges', () => {
  it('toBase matches BigInt#toString for safe integers', () => {
    const mismatches: string[] = [];
    let seed = 12345;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const values = [Number.MAX_SAFE_INTEGER, 2 ** 52 + 1, 2 ** 53 - 3];
    for (let i = 0; i < 4000; i++)
      values.push(Math.floor(random() * 2 ** (20 + Math.floor(random() * 33))));
    for (const value of values)
      for (const base of [2, 3, 7, 10, 16, 36]) {
        const expected = BigInt(value).toString(base).toUpperCase();
        const actual = toBase(value, base);
        if (actual !== expected)
          mismatches.push(`${value} base ${base}: ${actual} vs ${expected}`);
      }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  it('combination is exact while the true result is a safe integer', () => {
    const exact = (n: number, r: number) => {
      let result = 1n;
      for (let i = 0; i < r; i++) result = (result * BigInt(n - i)) / BigInt(i + 1);
      return result;
    };
    const mismatches: string[] = [];
    for (let n = 0; n <= 70; n++)
      for (let r = 0; r <= n; r++) {
        const expected = exact(n, r);
        if (expected > BigInt(Number.MAX_SAFE_INTEGER)) continue;
        const actual = combination(n, r);
        if (BigInt(actual) !== expected)
          mismatches.push(`C(${n},${r}) = ${actual}, exact ${expected}`);
      }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  it('fromBase rejects a lone minus sign as an invalid value', () => {
    expect(() => fromBase('-', 10)).toThrow();
  });

  it('gcd and lcm of short decimals equal the exact rational result', () => {
    const mismatches: string[] = [];
    const exactGcd = (a: number, b: number): number => (b === 0 ? a : exactGcd(b, a % b));
    let seed = 99;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < 3000; i++) {
      const digits = 1 + Math.floor(random() * 4);
      const scale = 10 ** digits;
      const a = 1 + Math.floor(random() * 5000);
      const b = 1 + Math.floor(random() * 5000);
      const left = a / scale;
      const right = b / scale;
      const g = exactGcd(a, b);
      const expectedGcd = g / scale;
      const expectedLcm = (a / g) * b / scale;
      const actualGcd = gcd(left, right);
      const actualLcm = lcm(left, right);
      if (actualGcd !== expectedGcd)
        mismatches.push(`gcd(${left}, ${right}) = ${actualGcd}, exact ${expectedGcd}`);
      if (actualLcm !== expectedLcm)
        mismatches.push(`lcm(${left}, ${right}) = ${actualLcm}, exact ${expectedLcm}`);
    }
    expect(mismatches.slice(0, 6)).toEqual([]);
  });
});

describe('round differential against lodash', () => {
  it('matches lodash round for random values and precisions, ignoring the sign of zero', async () => {
    const lodashRound = (await import('lodash')).default.round;
    let seed = 7;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const mismatches: string[] = [];
    for (let i = 0; i < 20000; i++) {
      const magnitude = 10 ** Math.floor(random() * 12 - 4);
      const value = Number(((random() - 0.5) * magnitude).toPrecision(1 + Math.floor(random() * 15)));
      const precision = Math.floor(random() * 9) - 3;
      const actual = round(value, precision);
      const expected = lodashRound(value, precision);
      if (actual !== expected && !(Number.isNaN(actual) && Number.isNaN(expected)))
        mismatches.push(`round(${value}, ${precision}) = ${actual}, lodash ${expected}`);
    }
    expect(mismatches.slice(0, 6)).toEqual([]);
  });
});
