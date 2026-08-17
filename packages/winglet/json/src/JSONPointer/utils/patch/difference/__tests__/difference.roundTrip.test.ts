import { describe, expect, it } from 'vitest';

import { mergePatch } from '../../mergePatch';
import { difference } from '../difference';

describe('difference round-trip', () => {
  it('removes missing properties from numeric-keyed objects', () => {
    const source = { a: { '0': 'x', '2': 'w' } };
    const target = { a: { '0': 'z' } };

    expect(mergePatch(source, difference(source, target))).toEqual(target);
  });

  it('preserves Date leaves instead of serializing them', () => {
    const source = { updatedAt: new Date('2024-01-01T00:00:00.000Z') };
    const target = { updatedAt: new Date('2025-01-01T00:00:00.000Z') };
    const patch = difference(source, target);

    expect(patch).toEqual({ updatedAt: target.updatedAt });
    expect(mergePatch(source, patch)).toEqual(target);
  });

  it('drops forbidden keys instead of exposing or polluting the patch', () => {
    const source = JSON.parse(
      '{"safe":1,"__proto__":{"x":1},"constructor":{"y":1},"prototype":{"z":1}}',
    );
    const target = JSON.parse(
      '{"safe":2,"__proto__":{"x":9},"constructor":{"y":9},"prototype":{"z":9}}',
    );
    const patch = difference(source, target) as Record<string, unknown>;

    expect(patch).toEqual({ safe: 2 });
    expect(Object.keys(patch)).toEqual(['safe']);
    expect(Object.getPrototypeOf(patch)).toBe(Object.prototype);
  });
});
