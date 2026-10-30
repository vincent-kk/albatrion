import { describe, expect, it } from 'vitest';

import type { FieldNodeRecord } from '@/schema-form/core/engine/record';

import type { SettlementContext } from '../../../types/settlement';
import { isWithinReplacePaths } from '../isWithinReplacePaths';

type TestNode = FieldNodeRecord<TestNode>;

const context = (replacePaths?: readonly string[]) =>
  ({ replacePaths }) as unknown as SettlementContext<TestNode>;

describe('isWithinReplacePaths (R1)', () => {
  it('counts every path outside a batch', () => {
    expect(isWithinReplacePaths(context(undefined), '/value')).toBe(true);
  });

  it('counts a written path, its descendants and its ancestors', () => {
    const batch = context(['/k', '/list/0/k']);
    expect(isWithinReplacePaths(batch, '/k')).toBe(true);
    expect(isWithinReplacePaths(batch, '/list/0')).toBe(true);
    expect(isWithinReplacePaths(batch, '/list/0/k/deep')).toBe(true);
  });

  it('rejects an untouched sibling and a prefix that is not a segment', () => {
    const batch = context(['/k']);
    expect(isWithinReplacePaths(batch, '/value')).toBe(false);
    expect(isWithinReplacePaths(batch, '/kind')).toBe(false);
  });

  it('counts everything under a written root path', () => {
    expect(isWithinReplacePaths(context(['']), '/anything')).toBe(true);
  });
});
