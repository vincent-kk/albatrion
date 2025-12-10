import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

const wait = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('ArrayNode', () => {
  it('automatically add items up to minItems', async () => {
    const MIN_ITEMS = 5;
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'string',
              default: 'hello',
            },
            minItems: MIN_ITEMS,
          },
        },
      },
    });

    await wait();

    expect(node?.value?.arr?.length).toBe(MIN_ITEMS);
  });

  it('add / remove / clear items', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'string',
              default: 'hello',
            },
          },
        },
      },
    });

    await delay();

    expect(node?.value?.arr).toEqual(undefined);

    await (node?.find('/arr') as ArrayNode)?.push();
    expect(node?.value?.arr).toMatchObject(['hello']);

    await (node?.find('/arr') as ArrayNode)?.push('world');
    expect(node?.value?.arr).toMatchObject(['hello', 'world']);

    await (node?.find('/arr') as ArrayNode)?.remove(0);
    expect(node?.value?.arr).toMatchObject(['world']);

    await (node?.find('/arr') as ArrayNode)?.clear();
    expect(node?.value?.arr).toEqual(undefined);
  });

  it('cannot exceed maxItems', async () => {
    const MAX_ITEMS = 3;
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'string',
              default: 'hello',
            },
            maxItems: MAX_ITEMS,
          },
        },
      },
    });
    expect(node?.value?.arr).toEqual(undefined);
    Array(MAX_ITEMS + 10)
      .fill(true)
      .forEach(() => {
        (node?.find('arr') as ArrayNode)?.push();
      });
    await delay();
    expect(node?.value?.arr.length).toBe(MAX_ITEMS);
  });

  it('array.getValue', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      defaultValue: {
        tags: ['harry', 'ron'],
      },
    });
    expect(node?.find('#/tags')?.value).toMatchObject(['harry', 'ron']);

    const found = node?.find('/tags');
    if (found?.type === 'array') {
      found.setValue(['Hermione', 'ron', 'harry']);
    }
    await delay();
    expect(node?.find('#/tags')?.value).toMatchObject([
      'Hermione',
      'ron',
      'harry',
    ]);
  });

  it('ArrayNode with defaultValue', () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
        },
        objectArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
      defaultValue: {
        array: [0, 0],
        objectArray: [
          {
            name: 'anonymous',
            age: 0,
          },
          {
            name: 'anonymous',
            age: 0,
          },
          {
            name: 'anonymous',
            age: 0,
          },
        ],
      },
    });

    expect(node.value).toEqual({
      array: [0, 0],
      objectArray: [
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
      ],
    });
  });

  it('ArrayNode with default in schema', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        array: {
          type: 'array',
          items: { type: 'number', default: 0 },
          minItems: 2,
        },
        objectArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'anonymous' },
              age: { type: 'number', default: 0 },
            },
          },
          minItems: 3,
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    });

    await wait();

    expect(node.value).toEqual({
      array: [0, 0],
      objectArray: [
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
        {
          name: 'anonymous',
          age: 0,
        },
      ],
    });
  });

  it('배열 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags');
    expect(arrayNode).toBeDefined();
    expect(arrayNode?.type).toBe('array');
  });

  it('배열 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;
    expect(arrayNode.value).toEqual([]);

    arrayNode.setValue(['태그1', '태그2', '태그3']);
    await delay();
    expect(arrayNode.value).toEqual(['태그1', '태그2', '태그3']);
  });

  it('배열 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['기본태그1', '기본태그2'],
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('tags') as ArrayNode;
    expect(arrayNode.value).toEqual(['기본태그1', '기본태그2']);
  });

  it('배열 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('/tags') as ArrayNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    arrayNode.subscribe(mockListener);

    // 값 변경
    arrayNode.setValue(['새태그1', '새태그2']);

    await delay();

    // After initialized, parent setValue with Isolate option causes events to merge
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type:
        NodeEventType.UpdateValue |
        NodeEventType.RequestRefresh |
        NodeEventType.UpdateChildren,
      payload: {
        [NodeEventType.UpdateValue]: ['새태그1', '새태그2'],
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: [],
          current: ['새태그1', '새태그2'],
        },
      },
    });
  });

  it('배열 노드의 아이템 추가가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('/tags') as ArrayNode;

    // 초기값 설정
    arrayNode.setValue(['태그1', '태그2']);
    await delay();

    // 아이템 추가
    await arrayNode.push('태그3');

    // 값 확인
    expect(arrayNode.value).toEqual(['태그1', '태그2', '태그3']);
  });

  it('배열 노드의 아이템 삭제가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('tags') as ArrayNode;

    // 초기값 설정
    arrayNode.setValue(['태그1', '태그2', '태그3']);

    await delay();
    // 아이템 삭제
    await arrayNode.remove(1);

    // 값 확인
    expect(arrayNode.value).toEqual(['태그1', '태그3']);
  });

  it('배열 노드의 아이템 이동이 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('tags') as ArrayNode;

    // 초기값 설정
    arrayNode.setValue(['태그1', '태그2', '태그3']);
  });

  it('배열 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
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
          numbers: {
            type: 'array',
            items: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            minItems: 2,
            maxItems: 5,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    await delay();

    const arrayNode = node?.find('/numbers') as ArrayNode;

    // 최소 아이템 수 이하 설정
    arrayNode.setValue([1]);
    await delay();

    expect(arrayNode.errors.length).toBeGreaterThan(0);
    expect(arrayNode.errors[0].keyword).toBe('minItems');

    // After commit 446a022c: setValue bypasses maxItems constraint (unlimited=true)
    // to allow explicit value setting regardless of schema limits
    arrayNode.setValue([1, 2, 3, 4, 5, 6]);
    await delay();

    expect(arrayNode.value?.length).toBe(6);

    // 유효한 값 설정
    arrayNode.setValue([1, 2, 3]);
    await delay();

    expect(arrayNode.errors).toEqual([]);

    // Array item에 대한 유효성 오류는 개별 item에 저장됨
    arrayNode.setValue([1, 2, 150]);
    await delay();

    expect(arrayNode.errors.length).toBe(0);
  });

  it('배열 노드의 고유 아이템 검사가 정상적으로 동작해야 함', async () => {
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
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    await delay();

    const arrayNode = node?.find('tags') as ArrayNode;

    // 중복 아이템이 있는 값 설정
    arrayNode.setValue(['태그1', '태그2', '태그1']);

    await delay();

    expect(arrayNode.errors.length).toBeGreaterThan(0);
    expect(arrayNode.errors[0].keyword).toBe('uniqueItems');

    // 중복 아이템이 없는 값 설정
    arrayNode.setValue(['태그1', '태그2', '태그3']);

    await delay();

    expect(arrayNode.errors).toEqual([]);
  });

  it('배열 노드의 복잡한 아이템 타입이 정상적으로 처리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
              required: ['name', 'age'],
            },
          },
        },
      },
    });

    await delay();

    const arrayNode = node?.find('users') as ArrayNode;

    // 복잡한 아이템 값 설정
    arrayNode.setValue([
      { name: '홍길동', age: 30 },
      { name: '김철수', age: 25 },
    ]);

    await delay();

    // 값 확인
    expect(arrayNode.value).toEqual([
      { name: '홍길동', age: 30 },
      { name: '김철수', age: 25 },
    ]);

    // 아이템 노드 확인
    const itemNodes = arrayNode.children || [];
    expect(itemNodes.length).toBe(2);
    expect(itemNodes[0].node.type).toBe('object');
    expect(itemNodes[1].node.type).toBe('object');

    // 아이템 노드의 자식 노드 확인
    const firstItemNameNode = itemNodes[0].node.find('name');
    const firstItemAgeNode = itemNodes[0].node.find('age');
    expect(firstItemNameNode?.value).toBe('홍길동');
    expect(firstItemAgeNode?.value).toBe(30);
  });

  it('잘못된 인덱스로 remove 호출 시 값을 변경하지 않고 undefined를 반환해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;
    arrayNode.setValue(['태그1', '태그2']);
    await delay();

    const invalidIndices = [-1, 2, 100];
    for (const idx of invalidIndices) {
      const removed = await arrayNode.remove(idx);
      await delay();
      expect(removed).toBeUndefined();
      expect(arrayNode.value).toEqual(['태그1', '태그2']);
    }
  });

  it('잘못된 인덱스로 update 호출 시 값을 변경하지 않고 undefined를 반환해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;
    arrayNode.setValue(['태그1', '태그2']);
    await delay();

    const invalidIndices = [-1, 2, 100];
    for (const idx of invalidIndices) {
      const updated = await arrayNode.update(idx, '변경값');
      await delay();
      expect(updated).toBeUndefined();
      expect(arrayNode.value).toEqual(['태그1', '태그2']);
    }
  });
});
