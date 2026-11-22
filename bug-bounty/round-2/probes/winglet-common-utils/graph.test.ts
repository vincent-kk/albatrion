import { describe, expect, it } from 'vitest';

import { createSafeFingerprint, parseGraph, stringifyGraph } from '@/common-utils/index';

const makeRandom = (start: number) => {
  let seed = start;
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
};

describe('graph codec round trip', () => {
  it('random acyclic data survives stringifyGraph and parseGraph with the same safe fingerprint', () => {
    const random = makeRandom(5);
    const leaves = [0, -0, NaN, Infinity, -Infinity, 1e21, 5e-324, '', '\ud800', 'a"b', true, null, undefined, 10n, -10n];
    const build = (depth: number): unknown => {
      const choice = random();
      if (depth > 4 || choice < 0.35) return leaves[Math.floor(random() * leaves.length)];
      if (choice < 0.5) {
        const array: unknown[] = new Array(Math.floor(random() * 5));
        for (let i = 0; i < array.length; i++) if (random() < 0.8) array[i] = build(depth + 1);
        return array;
      }
      if (choice < 0.6) return new Date(Math.floor(random() * 1e12));
      if (choice < 0.7) return [build(depth + 1)];
      if (choice < 0.75) return /a[b]/gimsuy;
      const object: Record<string, unknown> = random() < 0.2 ? Object.create(null) : {};
      for (const key of ['__proto__', 'constructor', '0', '10', 'b', 'a']) if (random() < 0.4) Object.defineProperty(object, key, { value: build(depth + 1), enumerable: true, writable: true, configurable: true });
      return object;
    };
    const failures: string[] = [];
    for (let i = 0; i < 800; i++) {
      const value = build(0);
      const restored = parseGraph(stringifyGraph(value));
      const left = createSafeFingerprint(value, { sort: false });
      const right = createSafeFingerprint(restored, { sort: false });
      if (left !== right) failures.push(left + ' !== ' + right);
    }
    expect(failures.slice(0, 3)).toEqual([]);
  });

  it('cycles and shared references keep identity', () => {
    const shared = { x: 1 };
    const root: any = { a: shared, b: [shared], m: new Map(), s: new Set() };
    root.self = root;
    root.m.set(root, shared);
    root.s.add(root.s);
    const restored: any = parseGraph(stringifyGraph(root));
    expect(restored.self).toBe(restored);
    expect(restored.a).toBe(restored.b[0]);
    expect(restored.m.get(restored)).toBe(restored.a);
    expect(restored.s.has(restored.s)).toBe(true);
  });

  it('a 10,000-deep chain round-trips without stack overflow', () => {
    let deep: any = { leaf: 1 };
    for (let i = 0; i < 10_000; i++) deep = { child: deep };
    const restored: any = parseGraph(stringifyGraph(deep));
    let depth = 0;
    let cursor = restored;
    while (cursor.child) {
      cursor = cursor.child;
      depth++;
    }
    expect(depth).toBe(10_000);
  });
});
