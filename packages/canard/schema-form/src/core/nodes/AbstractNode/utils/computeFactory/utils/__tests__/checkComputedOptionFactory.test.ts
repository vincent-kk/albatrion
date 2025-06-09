import { describe, expect, it } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { checkComputedOptionFactory } from '../checkComputedOptionFactory';
import { getPathManager } from '../getPathManager';

describe('checkComputedOptionFactory', () => {
  it('preferredCondition이 true일 때 항상 checkCondition을 반환', () => {
    const jsonSchema: JsonSchemaWithVirtual = { type: 'object', visible: true };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([])).toBe(true);
  });

  it('rootJsonSchema에 checkCondition이 있을 때도 항상 checkCondition을 반환', () => {
    const jsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const rootJsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      visible: false,
    };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = false;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([])).toBe(false);
  });

  it('computed string expression이 있을 때 동적으로 평가', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      computed: { visible: '/value > 10' },
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    // dependencies[0]이 11이면 true, 5면 false
    expect(fn && fn([11])).toBe(true);
    expect(fn && fn([5])).toBe(false);
    expect(pathManager.get()).toContain('/value');
  });

  it('computed가 undefined이고 &필드가 string일 때 동적으로 평가', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      '&visible': '#/count === 3',
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([3])).toBe(true);
    expect(fn && fn([2])).toBe(false);
    expect(pathManager.get()).toContain('/count');
  });

  it('computed string이 세미콜론으로 끝나도 정상 동작', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      computed: { visible: '#/value === 1;' },
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([1])).toBe(true);
    expect(fn && fn([2])).toBe(false);
  });

  it('computed string이 비어있으면 undefined 반환', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      computed: { visible: '' },
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeUndefined();
  });

  it('computed가 boolean이면 preferredCondition이 아니면 undefined', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      computed: { visible: false },
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeUndefined();
  });

  it('expression이 여러 dependencyPaths를 동적으로 추가', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      computed: { visible: '#/a > 1 && #/b < 5' },
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = true;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([2, 4])).toBe(true);
    expect(fn && fn([0, 4])).toBe(false);
    expect(fn && fn([2, 6])).toBe(false);
    expect(pathManager.get()).toContain('/a');
    expect(pathManager.get()).toContain('/b');
  });

  it('preferredCondition이 false일 때 항상 false 반환', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      visible: false,
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const checkCondition = false;
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
      checkCondition,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([])).toBe(false);
  });
});
