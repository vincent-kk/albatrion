import { describe, expect, it } from 'vitest';

import type { FlattenCondition } from '../flattenConditions';
import { getFieldConditionMap } from '../getFieldConditionMap/getFieldConditionMap';

describe('getFieldConditionMap', () => {
  it('필드별로 조건을 올바르게 매핑한다', () => {
    const conditions: FlattenCondition[] = [
      {
        condition: { x: 'SHOW Y' },
        required: ['y'],
      },
      {
        condition: { x: 'SHOW Y' },
        required: ['z'],
        inverse: true,
      },
      {
        condition: { a: ['1', '2'] },
        required: ['b', 'c'],
      },
    ];
    const map = getFieldConditionMap(conditions);
    expect(map?.size).toBe(6);
    expect(map?.get('y')).toEqual([
      { condition: { x: 'SHOW Y' }, inverse: undefined },
    ]);
    expect(map?.get('z')).toEqual([
      { condition: { x: 'SHOW Y' }, inverse: true },
    ]);
    expect(map?.get('b')).toEqual([
      { condition: { a: ['1', '2'] }, inverse: undefined },
    ]);
    expect(map?.get('c')).toEqual([
      { condition: { a: ['1', '2'] }, inverse: undefined },
    ]);
  });

  it('동일 필드에 여러 조건이 매핑될 때 모두 포함한다', () => {
    const conditions: FlattenCondition[] = [
      {
        condition: { type: 'error' },
        required: ['details'],
      },
      {
        condition: { type: 'error', status: ['pending', 'rejected'] },
        required: ['details'],
        inverse: true,
      },
    ];
    const map = getFieldConditionMap(conditions);
    expect(map?.size).toBe(3);
    expect(map?.get('details')).toEqual([
      { condition: { type: 'error' }, inverse: undefined },
      {
        condition: { type: 'error', status: ['pending', 'rejected'] },
        inverse: true,
      },
    ]);
  });

  it('빈 배열 입력 시 빈 Map을 반환한다', () => {
    const map = getFieldConditionMap([]);
    expect(map?.size).toBe(0);
  });
});
