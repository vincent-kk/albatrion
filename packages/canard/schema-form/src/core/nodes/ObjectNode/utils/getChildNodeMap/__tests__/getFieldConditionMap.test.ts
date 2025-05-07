import { describe, expect, it } from 'vitest';

import type { FlattenCondition } from '../utils/flattenConditions';
import { getConditionsMap } from '../utils/getConditionsMap';
import { getFieldConditionMap } from '../utils/getFieldConditionMap';

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
    expect(map?.get('a')).toBe(true);
    expect(map?.get('x')).toBe(true);
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
    expect(map?.get('type')).toBe(true);
    expect(map?.get('status')).toBe(true);
  });

  it('빈 배열 입력 시 빈 Map을 반환한다', () => {
    const map = getFieldConditionMap([]);
    expect(map?.size).toBe(0);
  });
});

describe('FieldConditionMap & getConditionsMap & getValueWithCondition', () => {
  it('should handle single const condition and required', () => {
    const conditions: FlattenCondition[] = [
      { condition: { type: 'A' }, required: ['foo'] },
    ];
    const map = getFieldConditionMap(conditions);
    expect(map?.get('foo')).toEqual([{ condition: { type: 'A' } }]);
    expect(map?.get('type')).toBe(true);

    const condMap = getConditionsMap(map!);
    expect(condMap?.get('foo')).toEqual(['_.type==="A"']);
  });

  it('should handle enum array condition and inverse', () => {
    const conditions: FlattenCondition[] = [
      { condition: { status: ['pending', 'done'] }, required: ['result'] },
      {
        condition: { status: ['pending', 'done'] },
        required: ['error'],
        inverse: true,
      },
    ];
    const map = getFieldConditionMap(conditions);
    expect(map?.get('result')).toEqual([
      { condition: { status: ['pending', 'done'] } },
    ]);
    expect(map?.get('error')).toEqual([
      { condition: { status: ['pending', 'done'] }, inverse: true },
    ]);
    expect(map?.get('status')).toBe(true);

    const condMap = getConditionsMap(map!);
    expect(condMap?.get('result')).toEqual([
      '["pending","done"].includes(_.status)',
    ]);
    expect(condMap?.get('error')).toEqual([
      '!["pending","done"].includes(_.status)',
    ]);
  });

  it('should handle multiple conditions and required fields', () => {
    const conditions: FlattenCondition[] = [
      { condition: { a: '1', b: '2' }, required: ['x', 'y'] },
      { condition: { a: '1', b: '3' }, required: ['z'] },
    ];
    const map = getFieldConditionMap(conditions);
    const xArr = map?.get('x');
    const yArr = map?.get('y');
    const zArr = map?.get('z');
    expect(Array.isArray(xArr) ? xArr[0].condition : undefined).toEqual({
      a: '1',
      b: '2',
    });
    expect(Array.isArray(yArr) ? yArr[0].condition : undefined).toEqual({
      a: '1',
      b: '2',
    });
    expect(Array.isArray(zArr) ? zArr[0].condition : undefined).toEqual({
      a: '1',
      b: '3',
    });
    expect(map?.get('a')).toBe(true);
    expect(map?.get('b')).toBe(true);
  });
});
