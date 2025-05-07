import { describe, expect, it } from 'vitest';

import type { FlattenCondition } from '../flattenConditions';
import { getConditionsMap } from '../getConditionsMap';
import { getFieldConditionMap } from '../getFieldConditionMap/';
import { getValueWithCondition } from '../getValueWithCondition';

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
    expect(condMap.get('foo')).toEqual(['_.type==="A"']);

    const schema = {
      type: 'object',
      properties: { type: {}, foo: {} },
    } as any;
    const value = { type: 'A', foo: 123 };
    expect(getValueWithCondition(value, schema, map)).toEqual({
      type: 'A',
      foo: 123,
    });
    expect(getValueWithCondition({ type: 'B', foo: 123 }, schema, map)).toEqual(
      { type: 'B' },
    );
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
    expect(condMap.get('result')).toEqual([
      '["pending","done"].includes(_.status)',
    ]);
    expect(condMap.get('error')).toEqual([
      '!["pending","done"].includes(_.status)',
    ]);

    const schema = {
      type: 'object',
      properties: { status: {}, result: {}, error: {} },
    } as any;
    expect(
      getValueWithCondition(
        { status: 'pending', result: 1, error: 2 },
        schema,
        map,
      ),
    ).toEqual({ status: 'pending', result: 1 });
    expect(
      getValueWithCondition(
        { status: 'fail', result: 1, error: 2 },
        schema,
        map,
      ),
    ).toEqual({ status: 'fail', error: 2 });
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

    const schema = {
      type: 'object',
      properties: { a: {}, b: {}, x: {}, y: {}, z: {} },
    } as any;
    expect(
      getValueWithCondition({ a: '1', b: '2', x: 1, y: 2, z: 3 }, schema, map),
    ).toEqual({ a: '1', b: '2', x: 1, y: 2 });
    expect(
      getValueWithCondition({ a: '1', b: '3', x: 1, y: 2, z: 3 }, schema, map),
    ).toEqual({ a: '1', b: '3', z: 3 });
    expect(
      getValueWithCondition({ a: '2', b: '2', x: 1, y: 2, z: 3 }, schema, map),
    ).toEqual({ a: '2', b: '2' });
  });

  it('should handle null, undefined, and empty values', () => {
    const map = getFieldConditionMap([]);
    const schema = { type: 'object', properties: { foo: {}, bar: {} } } as any;
    expect(getValueWithCondition(undefined, schema, map)).toBeUndefined();
    // @ts-ignore
    expect(getValueWithCondition(null, schema, map)).toBeNull();
    expect(getValueWithCondition({}, schema, map)).toEqual({});
  });

  it('should handle dangerous/edge values', () => {
    // 조건에 없는 필드, 타입 불일치, 중복 required, 특수문자 등
    const conditions: FlattenCondition[] = [
      { condition: { 'weird-key': '!' }, required: ['foo', 'foo'] },
      { condition: { foo: 'bar' }, required: ['baz'] },
    ];
    const map = getFieldConditionMap(conditions);
    const fooArr = map?.get('foo');
    const bazArr = map?.get('baz');
    expect(Array.isArray(fooArr) ? fooArr.length : undefined).toBe(undefined);
    expect(Array.isArray(bazArr) ? bazArr.length : undefined).toBe(1);
    expect(map?.get('weird-key')).toBe(true);

    const schema = {
      type: 'object',
      properties: { 'weird-key': {}, foo: {}, baz: {} },
    } as any;
    expect(
      getValueWithCondition({ 'weird-key': '!', foo: 1, baz: 2 }, schema, map),
    ).toEqual({ 'weird-key': '!', foo: 1 });
    expect(getValueWithCondition({ foo: 'bar', baz: 2 }, schema, map)).toEqual({
      foo: 'bar',
      baz: 2,
    });
    expect(getValueWithCondition({ foo: 123, baz: 2 }, schema, map)).toEqual({
      foo: 123,
    });
  });

  it('should handle array and object values in condition', () => {
    const conditions: FlattenCondition[] = [
      { condition: { arr: ['a', 'b'] }, required: ['foo'] },
      { condition: { obj: '[object Object]' }, required: ['bar'] },
    ];
    const map = getFieldConditionMap(conditions);
    const schema = {
      type: 'object',
      properties: { arr: {}, obj: {}, foo: {}, bar: {} },
    } as any;
    expect(
      getValueWithCondition({ arr: 'a', foo: 1, bar: 2 }, schema, map),
    ).toEqual({ arr: 'a', foo: 1 });
    expect(
      getValueWithCondition({ obj: '[object Object]', bar: 2 }, schema, map),
    ).toEqual({ obj: '[object Object]', bar: 2 });
  });
});
