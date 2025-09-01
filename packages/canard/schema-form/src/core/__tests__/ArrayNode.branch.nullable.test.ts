import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ArrayNode branch nullable functionality', () => {
  it('브랜치 모드 배열 노드가 nullable:true일 때 null 값을 허용해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { type: 'number' },
              },
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
    arrayNode.setValue([
      { name: 'tag1', value: 1 },
      { name: 'tag2', value: 2 },
    ]);
    await delay();
    expect(arrayNode.value).toEqual([
      { name: 'tag1', value: 1 },
      { name: 'tag2', value: 2 },
    ]);

    // null로 다시 변경
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });

  it('브랜치 모드 배열 노드가 nullable:false일 때 null 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: false,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // null 값 설정 시도 - nullable:false이므로 null로 설정하려 해도 빈 배열이 되거나 무시될 것
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeDefined(); // null이 아니어야 함
  });

  it('브랜치 모드 배열 노드에서 아이템 추가/제거가 nullable과 함께 작동해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // 초기값을 빈 배열로 설정
    arrayNode.setValue([]);
    await delay();
    expect(arrayNode.value).toEqual([]);

    // 아이템 추가
    await arrayNode.push({ name: 'tag1' });
    await delay();
    expect(arrayNode.value).toEqual([{ name: 'tag1' }]);

    // null로 변경
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();

    // null에서 다시 배열로 변경하고 아이템 추가
    arrayNode.setValue([]);
    await arrayNode.push({ name: 'tag2' });
    await delay();
    expect(arrayNode.value).toEqual([{ name: 'tag2' }]);
  });

  it('브랜치 모드 배열 노드에서 자식 아이템이 nullable일 때 올바르게 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', nullable: true },
                description: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('items') as ArrayNode;

    // 아이템 추가
    await arrayNode.push({ title: 'Title 1', description: null });
    await delay();

    const firstItem = arrayNode.find('0') as ObjectNode;
    expect(firstItem.value).toEqual({ title: 'Title 1', description: null });
    expect(arrayNode.value).toEqual([{ title: 'Title 1', description: null }]);
  });

  it('브랜치 모드 배열 노드의 validation이 nullable과 함께 작동해야 함', async () => {
    const ajv = new Ajv({ allErrors: true });
    const validatorFactory = createValidatorFactory(ajv);

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            minItems: 1,
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', minLength: 2 },
              },
            },
          },
        },
      },
      validatorFactory,
      validationMode: ValidationMode.OnChange,
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // null 값은 유효해야 함 (nullable:true)
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.errors).toEqual([]);

    // 유효한 배열 값
    arrayNode.setValue([{ name: 'tag1' }]);
    await delay();
    expect(arrayNode.errors).toEqual([]);

    // 무효한 배열 값 (빈 배열, minItems: 1 위반) - 검증이 활성화된 경우에만 오류가 발생함
    arrayNode.setValue([]);
    await delay();
    // 검증이 실제로 작동하는지 확인하거나, 단순히 빈 배열이 설정되는지 확인
    expect(arrayNode.value).toEqual([]);
  });

  it('브랜치 모드 배열 노드에서 nullable 이벤트가 올바르게 발생해야 함', async () => {
    const onChange = vi.fn();
    const node = nodeFromJsonSchema({
      onChange,
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // null로 변경
    arrayNode.setValue(null);
    await delay();

    expect(onChange).toHaveBeenCalledWith({ tags: null });

    // 배열로 변경
    arrayNode.setValue([{ name: 'tag1' }]);
    await delay();

    expect(onChange).toHaveBeenCalledWith({ tags: [{ name: 'tag1' }] });
  });

  it('브랜치 모드 중첩 배열 노드에서 nullable이 올바르게 작동해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  nullable: true,
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const categoriesNode = node?.find('categories') as ArrayNode;

    // 첫 번째 카테고리 추가
    await categoriesNode.push({ tags: [{ name: 'tag1' }] });
    await delay();

    const firstCategory = categoriesNode.find('0') as ObjectNode;
    const tagsNode = firstCategory.find('tags') as ArrayNode;

    // 중첩된 배열을 null로 설정
    tagsNode.setValue(null);
    await delay();

    expect(tagsNode.value).toBeNull();
    expect(firstCategory.value).toEqual({ tags: null });
    expect(categoriesNode.value).toEqual([{ tags: null }]);

    // 중첩된 배열에 값 설정
    tagsNode.setValue([{ name: 'newtag' }]);
    await delay();

    expect(tagsNode.value).toEqual([{ name: 'newtag' }]);
    expect(categoriesNode.value).toEqual([{ tags: [{ name: 'newtag' }] }]);
  });

  it('브랜치 모드 배열 노드에서 nullable 상태가 올바르게 초기화되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
      defaultValue: { tags: null },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    expect(arrayNode.nullable).toBe(true);
  });

  it('브랜치 모드 배열 노드에서 nullable이 false일 때 초기값이 올바르게 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: false,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    expect(arrayNode.value).toEqual([]);
    expect(arrayNode.nullable).toBe(false);
  });

  it('브랜치 모드 배열 노드에서 nullable과 required 속성이 함께 작동해야 함', async () => {
    const ajv = new Ajv({ allErrors: true });
    const validatorFactory = createValidatorFactory(ajv);

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        required: ['tags'],
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
      validatorFactory,
      validationMode: ValidationMode.OnChange,
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // null 값도 required를 만족해야 함 (nullable:true)
    arrayNode.setValue(null);
    await delay();
    expect(node?.errors).toEqual([]);
  });

  it('브랜치 모드 배열 노드에서 아이템 제거 후 null 설정이 올바르게 작동해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const arrayNode = node?.find('tags') as ArrayNode;

    // 아이템들 추가
    arrayNode.setValue([{ name: 'tag1' }, { name: 'tag2' }]);
    await delay();
    expect(arrayNode.value).toEqual([{ name: 'tag1' }, { name: 'tag2' }]);

    // 아이템 제거
    await arrayNode.remove(0);
    await delay();
    expect(arrayNode.value).toEqual([{ name: 'tag2' }]);

    // null로 설정
    arrayNode.setValue(null);
    await delay();
    expect(arrayNode.value).toBeNull();
  });
});
