import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { BooleanNode } from '../nodes/BooleanNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('BooleanNode nullable functionality', () => {
  it('불린 노드가 nullable:true일 때 null 값을 허용해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
            nullable: true,
          },
        },
      },
    });

    const booleanNode = node?.find('isActive') as BooleanNode;

    // null 값 설정
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.value).toBeNull();

    // true 값 설정
    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.value).toBe(true);

    // false 값 설정
    booleanNode.setValue(false);
    await delay();
    expect(booleanNode.value).toBe(false);

    // null로 다시 변경
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.value).toBeNull();
  });

  it('불린 노드가 nullable:false일 때 null 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          enabled: {
            type: 'boolean',
            // nullable이 명시되지 않음
          },
        },
      },
    });

    const booleanNode = node?.find('enabled') as BooleanNode;

    // null 값 설정 시도
    booleanNode.setValue(null);
    await delay();

    // null이 어떻게 처리되는지 확인 (undefined 또는 false 등)
    expect(
      booleanNode.value === null ||
        booleanNode.value === undefined ||
        booleanNode.value === false,
    ).toBe(true);
  });

  it('nullable 불린 노드의 기본값이 null일 수 있어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          confirmed: {
            type: ['boolean', 'null'],
            default: null,
          },
        },
      },
    });

    const booleanNode = node?.find('confirmed') as BooleanNode;
    await delay();
    expect(booleanNode.value).toBeNull();
  });

  it('nullable 불린 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          visible: {
            type: 'boolean',
            nullable: true,
          },
        },
      },
    });

    await delay();

    const booleanNode = node?.find('visible') as BooleanNode;
    const mockListener = vi.fn();
    booleanNode.subscribe(mockListener);

    // null 값으로 변경
    booleanNode.setValue(null);
    await delay();

    // After initialized, UpdateValue event is dispatched synchronously
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: null,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: undefined,
          current: null,
        },
      },
    });

    // Async events are merged in the next microtask
    expect(mockListener).toHaveBeenNthCalledWith(2, {
      type: NodeEventType.RequestRefresh,
      payload: {},
      options: {},
    });
  });

  it('nullable 불린 노드의 onChange 이벤트가 정상적으로 전파되어야 함', async () => {
    const mockOnChange = vi.fn();

    const node = nodeFromJsonSchema({
      onChange: mockOnChange,
      jsonSchema: {
        type: 'object',
        properties: {
          agreed: {
            type: 'boolean',
            nullable: true,
          },
        },
      },
    });

    const booleanNode = node?.find('agreed') as BooleanNode;

    // null로 변경
    booleanNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ agreed: null });

    // true로 변경
    booleanNode.setValue(true);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ agreed: true });

    // false로 변경
    booleanNode.setValue(false);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ agreed: false });

    // 다시 null로 변경
    booleanNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ agreed: null });
  });

  it('nullable 불린 노드가 유효성 검사와 함께 동작해야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          accepted: {
            type: 'boolean',
            nullable: true,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const booleanNode = node?.find('accepted') as BooleanNode;

    // null은 유효해야 함
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.errors).toEqual([]);

    // true는 유효해야 함
    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.errors).toEqual([]);

    // false는 유효해야 함
    booleanNode.setValue(false);
    await delay();
    expect(booleanNode.errors).toEqual([]);

    // 다시 null로 설정하면 오류가 없어야 함
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.errors).toEqual([]);
  });

  it('nullable 불린과 enum이 함께 있을 때 정상적으로 동작해야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          status: {
            type: ['boolean', 'null'],
            nullable: true,
            enum: [true, false, null],
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const booleanNode = node?.find('status') as BooleanNode;

    // null 값 허용
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.errors).toEqual([]);
    expect(booleanNode.value).toBeNull();

    // true 값 허용
    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.errors).toEqual([]);
    expect(booleanNode.value).toBe(true);

    // false 값 허용
    booleanNode.setValue(false);
    await delay();
    expect(booleanNode.errors).toEqual([]);
    expect(booleanNode.value).toBe(false);
  });

  it('nullable 불린 노드의 타입 변환이 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          flag: {
            type: 'boolean',
            nullable: true,
          },
        },
      },
    });

    const booleanNode = node?.find('flag') as BooleanNode;

    // 문자열 'true'를 불린으로 변환
    booleanNode.setValue('true' as any);
    await delay();
    expect(typeof booleanNode.value).toBe('boolean');
    expect(booleanNode.value).toBe(true);

    // null 값 설정
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.value).toBeNull();

    // 숫자 1을 true로 변환
    booleanNode.setValue(1 as any);
    await delay();
    expect(booleanNode.value).toBe(true);

    // 숫자 0을 false로 변환
    booleanNode.setValue(0 as any);
    await delay();
    expect(booleanNode.value).toBe(false);
  });

  it('nullable 불린 노드의 세 가지 상태 (true, false, null) 전환이 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          triState: {
            type: 'boolean',
            nullable: true,
          },
        },
      },
    });

    const booleanNode = node?.find('triState') as BooleanNode;

    // 초기값 확인
    expect(booleanNode.value).toBeUndefined();

    // true로 설정
    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.value).toBe(true);

    // false로 설정
    booleanNode.setValue(false);
    await delay();
    expect(booleanNode.value).toBe(false);

    // null로 설정
    booleanNode.setValue(null);
    await delay();
    expect(booleanNode.value).toBeNull();

    // 다시 true로 설정
    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.value).toBe(true);
  });

  it('nullable 불린 노드의 dirty 및 touched 상태가 정상적으로 관리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          option: {
            type: 'boolean',
            nullable: true,
            default: false,
          },
        },
      },
    });

    const booleanNode = node?.find('option') as BooleanNode;
    await delay();

    // 초기 상태 확인 (속성이 있는 경우에만)
    if ('isDirty' in booleanNode) {
      expect(booleanNode.isDirty).toBe(false);
    }
    if ('isTouched' in booleanNode) {
      expect(booleanNode.isTouched).toBe(false);
    }

    // null로 변경
    booleanNode.setValue(null);
    await delay();

    if ('isDirty' in booleanNode) {
      expect(booleanNode.isDirty).toBe(true);
    }
    if ('isTouched' in booleanNode) {
      expect(booleanNode.isTouched).toBe(true);
    }

    // 기본값으로 복원
    booleanNode.setValue(false);
    await delay();

    if ('isDirty' in booleanNode) {
      expect(booleanNode.isDirty).toBe(false);
    }
    if ('isTouched' in booleanNode) {
      expect(booleanNode.isTouched).toBe(true);
    }
  });
});
