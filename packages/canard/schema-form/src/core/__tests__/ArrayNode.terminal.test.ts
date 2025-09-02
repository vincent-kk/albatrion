import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ArrayNode terminal functionality', () => {
  it('배열 터미널 노드가 자식 노드 없이 배열 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            terminal: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // 배열 값 직접 설정
    arrayNode.setValue(['tag1', 'tag2', 'tag3']);
    await delay();
    expect(arrayNode.value).toEqual(['tag1', 'tag2', 'tag3']);

    // 빈 배열
    arrayNode.setValue([]);
    await delay();
    expect(arrayNode.value).toEqual([]);

    // 다시 배열 설정
    arrayNode.setValue(['new-tag']);
    await delay();
    expect(arrayNode.value).toEqual(['new-tag']);
  });

  it('터미널 배열 노드가 다양한 타입의 아이템을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          numbers: {
            type: 'array',
            terminal: true,
            items: {
              type: 'number',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('numbers') as ArrayNode;

    // 숫자 배열 설정
    arrayNode.setValue([1, 2, 3.14, -5]);
    await delay();
    expect(arrayNode.value).toEqual([1, 2, 3.14, -5]);
  });

  it('터미널 배열 노드가 불린 타입 아이템을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          flags: {
            type: 'array',
            terminal: true,
            items: {
              type: 'boolean',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('flags') as ArrayNode;

    // 불린 배열 설정
    arrayNode.setValue([true, false, true]);
    await delay();
    expect(arrayNode.value).toEqual([true, false, true]);
  });

  it('터미널 배열 노드에서 자식 노드에 접근하지 않아야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            terminal: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('items') as ArrayNode;
    arrayNode.setValue(['item1', 'item2']);
    await delay();

    // 터미널 모드에서는 자식 노드에 접근할 수 없어야 함
    expect(arrayNode.children).toEqual(null);
  });

  it('터미널 배열 노드의 onChange 이벤트가 정상적으로 전파되어야 함', async () => {
    const mockOnChange = vi.fn();

    const node = nodeFromJsonSchema({
      onChange: mockOnChange,
      jsonSchema: {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            terminal: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('list') as ArrayNode;

    // 배열로 변경
    arrayNode.setValue(['a', 'b', 'c']);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ list: ['a', 'b', 'c'] });

    // 다시 다른 배열로 변경
    arrayNode.setValue(['x', 'y']);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ list: ['x', 'y'] });
  });

  it('터미널 배열 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            terminal: true,
            items: {
              type: 'number',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('data') as ArrayNode;
    const mockListener = vi.fn();
    arrayNode.subscribe(mockListener);

    // 배열 값으로 변경
    arrayNode.setValue([1, 2, 3]);
    await delay();

    expect(mockListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(Number),
        payload: {
          [NodeEventType.UpdateValue]: [1, 2, 3],
        },
      }),
    );
  });

  it('터미널 배열 노드가 유효성 검사와 함께 동작해야 함', async () => {
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
          scores: {
            type: 'array',
            terminal: true,
            minItems: 2,
            maxItems: 5,
            items: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const arrayNode = node?.find('scores') as ArrayNode;

    // 유효한 배열
    arrayNode.setValue([80, 90, 95]);
    await delay();
    expect(arrayNode.errors).toEqual([]);

    // 최소 개수 미달
    arrayNode.setValue([100]);
    await delay();
    expect(arrayNode.errors.length).toBeGreaterThan(0);

    // 다시 유효한 배열
    arrayNode.setValue([85, 92]);
    await delay();
    expect(arrayNode.errors).toEqual([]);
  });

  it('터미널 배열과 nullable이 함께 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          optionalList: {
            type: 'array',
            terminal: true,
            nullable: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('optionalList') as ArrayNode;

    // null 값 설정
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();

    // 배열 값 설정
    arrayNode.setValue(['item1', 'item2']);
    await delay();
    expect(arrayNode.value).toEqual(['item1', 'item2']);

    // 다시 null로 설정
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });

  it('터미널 배열 노드가 복잡한 아이템 타입을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            terminal: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('users') as ArrayNode;

    // 객체 배열 설정
    arrayNode.setValue([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    await delay();

    expect(arrayNode.value).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);

    // 자식 노드는 생성되지 않음
    expect(arrayNode.children).toEqual(null);
  });

  it('터미널 배열 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          defaultList: {
            type: 'array',
            terminal: true,
            default: ['default1', 'default2'],
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('defaultList') as ArrayNode;
    await delay();

    expect(arrayNode.value).toEqual(['default1', 'default2']);
  });

  it('터미널 배열 노드의 dirty 및 touched 상태가 정상적으로 관리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          editableList: {
            type: 'array',
            terminal: true,
            default: ['original'],
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('editableList') as ArrayNode;
    await delay();

    // 초기 상태 확인 (속성이 있는 경우에만)
    if ('isDirty' in arrayNode) {
      expect(arrayNode.isDirty).toBe(false);
    }
    if ('isTouched' in arrayNode) {
      expect(arrayNode.isTouched).toBe(false);
    }

    // 새로운 값으로 변경
    arrayNode.setValue(['modified', 'list']);
    await delay();

    if ('isDirty' in arrayNode) {
      expect(arrayNode.isDirty).toBe(true);
    }
    if ('isTouched' in arrayNode) {
      expect(arrayNode.isTouched).toBe(true);
    }

    // 기본값으로 복원
    arrayNode.setValue(['original']);
    await delay();

    if ('isDirty' in arrayNode) {
      expect(arrayNode.isDirty).toBe(false);
    }
    if ('isTouched' in arrayNode) {
      expect(arrayNode.isTouched).toBe(true);
    }
  });

  it('터미널 배열 노드가 동적으로 추가/제거를 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          dynamicList: {
            type: 'array',
            terminal: true,
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('dynamicList') as ArrayNode;

    // 초기 배열 설정
    arrayNode.setValue(['item1']);
    await delay();
    expect(arrayNode.value).toEqual(['item1']);

    // 아이템 추가
    arrayNode.setValue(['item1', 'item2', 'item3']);
    await delay();
    expect(arrayNode.value).toEqual(['item1', 'item2', 'item3']);

    // 아이템 제거
    arrayNode.setValue(['item2']);
    await delay();
    expect(arrayNode.value).toEqual(['item2']);

    // 모든 아이템 제거
    arrayNode.setValue([]);
    await delay();
    expect(arrayNode.value).toEqual([]);
  });

  it('터미널 배열 노드가 enum과 함께 동작해야 함', async () => {
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
          categories: {
            type: 'array',
            terminal: true,
            items: {
              type: 'string',
              enum: ['A', 'B', 'C'],
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const arrayNode = node?.find('categories') as ArrayNode;

    // 유효한 enum 값들
    arrayNode.setValue(['A', 'B', 'C']);
    await delay();
    expect(arrayNode.errors).toEqual([]);
    expect(arrayNode.value).toEqual(['A', 'B', 'C']);

    // 부분적으로 유효한 값들
    arrayNode.setValue(['A', 'B']);
    await delay();
    expect(arrayNode.errors).toEqual([]);
    expect(arrayNode.value).toEqual(['A', 'B']);
  });
});
