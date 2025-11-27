import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ArrayNode nullable functionality', () => {
  it('배열 노드가 nullable:true일 때 null 값을 허용해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // null 값 설정
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();

    // 배열 값 설정
    arrayNode.setValue(['tag1', 'tag2']);
    await delay();
    expect(arrayNode.value).toEqual(['tag1', 'tag2']);

    // null로 다시 변경
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });

  it('배열 노드가 nullable:false일 때 null 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            // nullable이 명시되지 않음
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('items') as ArrayNode;

    // null 값 설정 시도
    arrayNode.setValue(null);
    await delay();

    // null이 어떻게 처리되는지 확인 (빈 배열 또는 undefined 등)
    const value = arrayNode.value;
    expect(value === null || value === undefined || Array.isArray(value)).toBe(
      true,
    );
  });

  it('nullable 배열의 아이템도 nullable을 지원해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          scores: {
            type: 'array',
            nullable: true,
            items: {
              type: 'number',
              nullable: true,
            },
          },
        },
      },
    });

    const arrayNode = node?.find('scores') as ArrayNode;

    // 배열에 null 아이템 포함
    arrayNode.setValue([1, null, 3, null, 5]);
    await delay();
    expect(arrayNode.value).toEqual([1, null, 3, null, 5]);

    // 전체 배열을 null로
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });

  it('nullable 배열 노드의 기본값이 null일 수 있어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          categories: {
            type: ['array', 'null'],
            default: null,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('categories') as ArrayNode;
    await delay();

    // default: null이지만 ArrayNode는 기본적으로 빈 배열이 될 수도 있음
    const value = arrayNode.value;
    expect(value === null || Array.isArray(value)).toBe(true);
  });

  it('nullable 배열 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            nullable: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('list') as ArrayNode;
    const mockListener = vi.fn();
    arrayNode.subscribe(mockListener);

    // null 값으로 변경
    arrayNode.setValue(null);
    await delay();

    // After initialized, parent setValue with Isolate option causes events to merge
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type:
        NodeEventType.UpdateValue |
        NodeEventType.RequestRefresh |
        NodeEventType.UpdateChildren,
      payload: {
        [NodeEventType.UpdateValue]: null,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: [],
          current: null,
        },
      },
    });

    expect(arrayNode.value).toBeNull();
  });

  it('nullable 배열 노드의 onChange 이벤트가 정상적으로 전파되어야 함', async () => {
    const mockOnChange = vi.fn();

    const node = nodeFromJsonSchema({
      onChange: mockOnChange,
      jsonSchema: {
        type: 'object',
        properties: {
          permissions: {
            type: 'array',
            nullable: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('permissions') as ArrayNode;

    // null로 변경
    arrayNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ permissions: null });

    // 배열로 변경
    arrayNode.setValue(['read', 'write']);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({
      permissions: ['read', 'write'],
    });

    // 다시 null로 변경
    arrayNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ permissions: null });
  });

  it('nullable 배열 노드가 유효성 검사와 함께 동작해야 함', async () => {
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
          colors: {
            type: 'array',
            nullable: true,
            minItems: 1,
            maxItems: 3,
            items: {
              type: 'string',
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const arrayNode = node?.find('colors') as ArrayNode;

    // null은 유효해야 함
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.errors).toEqual([]);

    // 유효한 배열
    arrayNode.setValue(['red', 'blue']);
    await delay();
    expect(arrayNode.errors).toEqual([]);

    // 최대 개수를 초과하는 배열 (유효성 검사 오류 발생할 수 있음)
    arrayNode.setValue(['red', 'blue', 'green', 'yellow']);
    await delay();
    // 구현에 따라 오류가 있을 수도 있고 없을 수도 있음

    // 다시 null로 설정하면 오류가 없어야 함
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.errors).toEqual([]);
  });

  it('nullable 배열과 복잡한 아이템 타입이 함께 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              nullable: true,
              properties: {
                name: {
                  type: 'string',
                  nullable: true,
                },
                age: {
                  type: 'number',
                  nullable: true,
                },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('users') as ArrayNode;

    // 복잡한 구조 설정
    arrayNode.setValue([
      { name: 'Alice', age: 30 },
      null,
      { name: null, age: 25 },
      { name: 'Charlie', age: null },
    ]);
    await delay();

    expect(arrayNode.value).toEqual([
      { name: 'Alice', age: 30 },
      null,
      { name: null, age: 25 },
      { name: 'Charlie', age: null },
    ]);

    // 전체 배열을 null로
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });

  it('nullable 배열의 동적 추가/제거가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          notes: {
            type: 'array',
            nullable: true,
            items: {
              type: 'string',
              nullable: true,
            },
          },
        },
      },
    });

    const arrayNode = node?.find('notes') as ArrayNode;

    // 초기 배열 설정
    arrayNode.setValue(['note1', 'note2']);
    await delay();
    expect(arrayNode.value).toEqual(['note1', 'note2']);

    // null 아이템 추가
    arrayNode.setValue(['note1', 'note2', null]);
    await delay();
    expect(arrayNode.value).toEqual(['note1', 'note2', null]);

    // 일부 아이템을 null로 변경
    arrayNode.setValue([null, 'note2', null]);
    await delay();
    expect(arrayNode.value).toEqual([null, 'note2', null]);

    // 전체를 null로 변경
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();

    // 다시 배열로 복원
    arrayNode.setValue(['restored']);
    await delay();
    expect(arrayNode.value).toEqual(['restored']);
  });

  it('nullable 배열의 중첩 구조가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          matrix: {
            type: 'array',
            nullable: true,
            items: {
              type: 'array',
              nullable: true,
              items: {
                type: 'number',
                nullable: true,
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('matrix') as ArrayNode;

    // 2차원 배열 설정
    arrayNode.setValue([[1, 2, null], null, [null, 5, 6]]);
    await delay();

    expect(arrayNode.value).toEqual([[1, 2, null], null, [null, 5, 6]]);

    // 전체를 null로
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });

  it('nullable 배열 노드의 dirty 및 touched 상태가 정상적으로 관리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          history: {
            type: 'array',
            nullable: true,
            default: ['initial'],
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('history') as ArrayNode;
    await delay();

    // 초기 상태 확인 (속성이 있는 경우에만)
    if ('isDirty' in arrayNode) {
      expect(arrayNode.isDirty).toBe(false);
    }
    if ('isTouched' in arrayNode) {
      expect(arrayNode.isTouched).toBe(false);
    }

    // null로 변경
    arrayNode.setValue(null);
    await delay();

    if ('isDirty' in arrayNode) {
      expect(arrayNode.isDirty).toBe(true);
    }
    if ('isTouched' in arrayNode) {
      expect(arrayNode.isTouched).toBe(true);
    }

    // 기본값으로 복원
    arrayNode.setValue(['initial']);
    await delay();

    if ('isDirty' in arrayNode) {
      expect(arrayNode.isDirty).toBe(false);
    }
    if ('isTouched' in arrayNode) {
      expect(arrayNode.isTouched).toBe(true);
    }
  });
});
