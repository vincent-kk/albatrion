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

    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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

    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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

    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
    );
    expect(fn?.([])).toBe(false);
  });

  it('expression이 여러 dependencyPaths를 동적으로 추가', () => {
    const jsonSchema: JsonSchemaWithVirtual = {
      type: 'object',
      computed: { visible: '#/a > 1 && #/b < 5' },
    };
    const rootJsonSchema: JsonSchemaWithVirtual = { type: 'object' };
    const pathManager = getPathManager();
    const fieldName = 'visible';
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
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
    const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
      pathManager,
      fieldName,
    );
    expect(fn).toBeDefined();
    expect(fn && fn([])).toBe(false);
  });

  describe('Priority order tests', () => {
    it('rootJsonSchema[fieldName]이 최우선 순위로 적용됨', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        visible: false,
        computed: { visible: false },
        '&visible': '/value === 1',
      };
      const rootJsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        visible: true,
      };
      const pathManager = getPathManager();
      const fieldName = 'visible';

      const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        fieldName,
      );
      expect(fn).toBeDefined();
      // rootJsonSchema.visible = true가 최우선이므로 항상 true
      expect(fn && fn([])).toBe(true);
      expect(fn && fn([1])).toBe(true);
      expect(fn && fn([0])).toBe(true);
    });

    it('jsonSchema[fieldName]이 두번째 우선순위로 적용됨', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        visible: true,
        computed: { visible: '/value > 5' },
        '&visible': '/value === 1',
      };
      const rootJsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        // rootJsonSchema에 visible 정의 없음
      };
      const pathManager = getPathManager();
      const fieldName = 'visible';

      const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        fieldName,
      );
      expect(fn).toBeDefined();
      // jsonSchema.visible = true가 적용됨
      expect(fn && fn([])).toBe(true);
      expect(fn && fn([6])).toBe(true);
      expect(fn && fn([5])).toBe(true);
    });

    it('jsonSchema.computed[fieldName]이 세번째 우선순위로 적용됨', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        // visible 직접 정의 없음
        computed: { visible: '/value > 5' },
        '&visible': '/value === 1',
      };
      const rootJsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        // rootJsonSchema에 visible 정의 없음
      };
      const pathManager = getPathManager();
      const fieldName = 'visible';

      const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        fieldName,
      );
      expect(fn).toBeDefined();
      // computed.visible = '/value > 5'가 적용됨
      expect(fn && fn([6])).toBe(true);
      expect(fn && fn([5])).toBe(false);
      expect(fn && fn([1])).toBe(false);
    });

    it('jsonSchema[&fieldName]이 마지막 우선순위로 적용됨', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        // visible 직접 정의 없음
        // computed.visible 정의 없음
        '&visible': '/count === 3',
      };
      const rootJsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        // rootJsonSchema에 visible 정의 없음
      };
      const pathManager = getPathManager();
      const fieldName = 'visible';

      const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        fieldName,
      );
      expect(fn).toBeDefined();
      // &visible = '/count === 3'가 적용됨
      expect(fn && fn([3])).toBe(true);
      expect(fn && fn([2])).toBe(false);
      expect(fn && fn([4])).toBe(false);
    });

    it('boolean 값은 즉시 함수로 반환되고 string은 동적 함수로 변환됨', () => {
      // Case 1: boolean 값
      const jsonSchema1: JsonSchemaWithVirtual = {
        type: 'object',
        readOnly: true,
      };
      const rootJsonSchema1: JsonSchemaWithVirtual = { type: 'object' };
      const pathManager1 = getPathManager();

      const fn1 = checkComputedOptionFactory(jsonSchema1, rootJsonSchema1)(
        pathManager1,
        'readOnly',
      );
      expect(fn1).toBeDefined();
      expect(fn1 && fn1([])).toBe(true);

      // Case 2: string 값 (동적 계산)
      const jsonSchema2: JsonSchemaWithVirtual = {
        type: 'object',
        computed: { readOnly: '/isLocked === true' },
      };
      const rootJsonSchema2: JsonSchemaWithVirtual = { type: 'object' };
      const pathManager2 = getPathManager();

      const fn2 = checkComputedOptionFactory(jsonSchema2, rootJsonSchema2)(
        pathManager2,
        'readOnly',
      );
      expect(fn2).toBeDefined();
      expect(fn2 && fn2([true])).toBe(true);
      expect(fn2 && fn2([false])).toBe(false);
    });

    it('여러 필드가 복합적으로 정의되어 있을 때 각각 올바른 우선순위 적용', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        visible: true, // 2순위
        readOnly: false, // 2순위
        computed: {
          visible: '/value > 10', // 무시됨 (visible이 root에 있음)
          disabled: '/locked === true', // 3순위, 적용됨
          active: false, // 무시됨 (active가 root에 있음)
        },
        '&disabled': '/value < 0', // 무시됨 (computed.disabled가 있음)
        '&readOnly': '/protected === true', // 무시됨 (readOnly가 이미 있음)
      };
      const rootJsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        visible: false, // 1순위, 최우선
        active: true, // 1순위, 최우선
      };
      const pathManager = getPathManager();

      // visible 체크
      const visibleFn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        'visible',
      );
      expect(visibleFn && visibleFn([])).toBe(false); // rootJsonSchema.visible = false

      // readOnly 체크
      const readOnlyFn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        'readOnly',
      );
      expect(readOnlyFn && readOnlyFn([])).toBe(false); // jsonSchema.readOnly = false

      // disabled 체크
      const disabledFn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        'disabled',
      );
      expect(disabledFn && disabledFn([true])).toBe(true); // computed.disabled 적용
      expect(disabledFn && disabledFn([false])).toBe(false);

      // active 체크
      const activeFn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        'active',
      );
      expect(activeFn && activeFn([])).toBe(true); // rootJsonSchema.active = true
    });

    it('모든 우선순위가 정의되어 있을 때 가장 높은 우선순위만 적용', () => {
      const jsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        disabled: false, // 2순위 - 무시됨
        computed: {
          disabled: '/value > 10', // 3순위 - 무시됨
        },
        '&disabled': '/count === 5', // 4순위 - 무시됨
      };
      const rootJsonSchema: JsonSchemaWithVirtual = {
        type: 'object',
        disabled: true, // 1순위 - 이것만 적용됨
      };
      const pathManager = getPathManager();

      const fn = checkComputedOptionFactory(jsonSchema, rootJsonSchema)(
        pathManager,
        'disabled',
      );
      expect(fn).toBeDefined();
      // rootJsonSchema.disabled = true가 최우선이므로 항상 true
      expect(fn && fn([])).toBe(true);
      expect(fn && fn([100])).toBe(true); // value > 10이지만 무시됨
      expect(fn && fn([5])).toBe(true); // count === 5이지만 무시됨
    });
  });
});
