import { describe, expect, it } from 'vitest';

import type { FieldNodeRecord } from '@/schema-form/core/engine/record';

import { FieldNodeWriteKind } from '../../../../types/value';
import type { SettlementContext } from '../../../types/settlement';
import { isWithinReplacementPaths } from '../isWithinReplacementPaths';

type TestNode = FieldNodeRecord<TestNode>;

const context = (replacementPaths?: readonly string[]) =>
  ({
    writeOrigins: replacementPaths?.map((path) => ({
      path,
      source: FieldNodeWriteKind.CallerReplace,
    })),
  }) as unknown as SettlementContext<TestNode>;

describe('isWithinReplacementPaths (R1)', () => {
  it('counts every path outside a batch', () => {
    expect(isWithinReplacementPaths(context(undefined), '/value')).toBe(true);
  });

  it('counts a written path, its descendants and its ancestors', () => {
    const batch = context(['/k', '/list/0/k']);
    expect(isWithinReplacementPaths(batch, '/k')).toBe(true);
    expect(isWithinReplacementPaths(batch, '/list/0')).toBe(true);
    expect(isWithinReplacementPaths(batch, '/list/0/k/deep')).toBe(true);
  });

  it('rejects an untouched sibling and a prefix that is not a segment', () => {
    const batch = context(['/k']);
    expect(isWithinReplacementPaths(batch, '/value')).toBe(false);
    expect(isWithinReplacementPaths(batch, '/kind')).toBe(false);
  });

  it('counts everything under a written root path', () => {
    expect(isWithinReplacementPaths(context(['']), '/anything')).toBe(true);
  });
});
