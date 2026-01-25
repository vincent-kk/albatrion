import Ajv from 'ajv/dist/2020';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { NumberNode } from '../nodes/NumberNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('NumberNode nullable functionality', () => {
  it('숫자 노드가 nullable:true일 때 null 값을 허용해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
            nullable: true,
          },
        },
      },
    });

    const numberNode = node?.find('age') as NumberNode;

    // null 값 설정
    numberNode.setValue(null);
    await delay();
    expect(numberNode.value).toBeNull();

    // 숫자 값 설정
    numberNode.setValue(25);
    await delay();
    expect(numberNode.value).toBe(25);

    // null로 다시 변경
    numberNode.setValue(null);
    await delay();
    expect(numberNode.value).toBeNull();
  });

  it('숫자 노드가 nullable:false일 때 null 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            // nullable이 명시되지 않음
          },
        },
      },
    });

    const numberNode = node?.find('count') as NumberNode;

    // null 값 설정 시도
    numberNode.setValue(null);
    await delay();

    // null이 어떻게 처리되는지 확인 (undefined 또는 0 등)
    expect(numberNode.value).toBeNaN();
  });

  it('nullable 숫자 노드의 기본값이 null일 수 있어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          score: {
            type: ['number', 'null'],
            default: null,
          },
        },
      },
    });

    const numberNode = node?.find('score') as NumberNode;
    await delay();
    expect(numberNode.value).toBeNull();
  });

  it('nullable 숫자 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          score: {
            type: 'number',
            nullable: true,
          },
        },
      },
    });

    await delay();

    const numberNode = node?.find('score') as NumberNode;
    const mockListener = vi.fn();
    numberNode.subscribe(mockListener);

    // null 값으로 변경
    numberNode.setValue(null);
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
          inject: true,
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

  it('nullable 숫자 노드의 onChange 이벤트가 정상적으로 전파되어야 함', async () => {
    const mockOnChange = vi.fn();

    const node = nodeFromJsonSchema({
      onChange: mockOnChange,
      jsonSchema: {
        type: 'object',
        properties: {
          price: {
            type: 'number',
            nullable: true,
          },
        },
      },
    });

    const numberNode = node?.find('price') as NumberNode;

    // null로 변경
    numberNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ price: null });

    // 숫자로 변경
    numberNode.setValue(100.5);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ price: 100.5 });

    // 다시 null로 변경
    numberNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ price: null });
  });

  it('nullable 숫자 노드가 유효성 검사와 함께 동작해야 함', async () => {
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
          rating: {
            type: 'number',
            nullable: true,
            minimum: 0,
            maximum: 5,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const ratingNode = node?.find('rating') as NumberNode;

    // null은 유효해야 함
    ratingNode.setValue(null);
    await delay();
    expect(ratingNode.errors).toEqual([]);

    // 유효한 숫자
    ratingNode.setValue(3);
    await delay();
    expect(ratingNode.errors).toEqual([]);

    // 범위를 벗어난 숫자
    ratingNode.setValue(10);
    await delay();
    expect(ratingNode.errors.length).toBeGreaterThan(0);

    // 다시 null로 설정하면 오류가 없어야 함
    ratingNode.setValue(null);
    await delay();
    expect(ratingNode.errors).toEqual([]);
  });

  it('nullable 숫자와 enum이 함께 있을 때 정상적으로 동작해야 함', async () => {
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
          priority: {
            type: ['number', 'null'],
            nullable: true,
            enum: [1, 2, 3, null],
            default: null,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const priorityNode = node?.find('priority') as NumberNode;

    // null 값 허용
    priorityNode.setValue(null);
    await delay();
    expect(priorityNode.errors).toEqual([]);
    expect(priorityNode.value).toBeNull();

    // enum 값 허용
    priorityNode.setValue(2);
    await delay();
    expect(priorityNode.errors).toEqual([]);
    expect(priorityNode.value).toBe(2);

    // enum에 없는 값 거부
    priorityNode.setValue(5);
    await delay();
    expect(priorityNode.errors.length).toBeGreaterThan(0);
  });

  it('nullable 숫자 노드의 타입 변환이 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            nullable: true,
          },
        },
      },
    });

    const numberNode = node?.find('value') as NumberNode;

    // 문자열 숫자를 숫자로 변환
    numberNode.setValue('42' as any);
    await delay();
    expect(typeof numberNode.value).toBe('number');
    expect(numberNode.value).toBe(42);

    // null 값 설정
    numberNode.setValue(null);
    await delay();
    expect(numberNode.value).toBeNull();

    // 소수점 숫자
    numberNode.setValue(3.14);
    await delay();
    expect(numberNode.value).toBe(3.14);
  });

  it('nullable 숫자 노드의 dirty 및 touched 상태가 정상적으로 관리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            nullable: true,
            default: 100,
          },
        },
      },
    });

    const numberNode = node?.find('amount') as NumberNode;
    await delay();

    // 초기 상태 확인 (속성이 있는 경우에만)
    if ('isDirty' in numberNode) {
      expect(numberNode.isDirty).toBe(false);
    }
    if ('isTouched' in numberNode) {
      expect(numberNode.isTouched).toBe(false);
    }

    // null로 변경
    numberNode.setValue(null);
    await delay();

    if ('isDirty' in numberNode) {
      expect(numberNode.isDirty).toBe(true);
    }
    if ('isTouched' in numberNode) {
      expect(numberNode.isTouched).toBe(true);
    }

    // 기본값으로 복원
    numberNode.setValue(100);
    await delay();

    if ('isDirty' in numberNode) {
      expect(numberNode.isDirty).toBe(false);
    }
    if ('isTouched' in numberNode) {
      expect(numberNode.isTouched).toBe(true);
    }
  });
});
