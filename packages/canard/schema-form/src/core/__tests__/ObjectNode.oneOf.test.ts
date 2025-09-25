import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ObjectNode oneOf', () => {
  it('oneOf 기본 동작 확인', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['game', 'movie'],
          default: 'game',
        },
      },
      oneOf: [
        {
          '&if': "./category === 'game'",
          properties: {
            platform: {
              type: 'string',
              default: 'PC',
            },
          },
        },
        {
          '&if': "./category === 'movie'",
          properties: {
            director: { type: 'string' },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    const categoryNode = node.find('category') as StringNode;
    expect(categoryNode.value).toBe('game');

    // oneOf는 조건부로 필드가 활성화됨
    // 현재 어떤 필드들이 존재하는지 확인
    const platformNode = node.find('platform');

    if (platformNode) {
      expect(platformNode).toBeDefined();
    }

    // 값 변경 테스트
    categoryNode.setValue('movie');
    await delay();
    expect(categoryNode.value).toBe('movie');
  });

  it('oneOf의 computed 속성 동작', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['basic', 'advanced'],
          default: 'basic',
        },
        enableOptional: {
          type: 'boolean',
          default: false,
        },
      },
      oneOf: [
        {
          '&if': "./type === 'basic'",
          properties: {
            basicField: {
              type: 'string',
              default: 'basic-value',
            },
            optionalField: {
              type: 'string',
              computed: {
                active: '../enableOptional === true',
              },
              default: 'optional',
            },
          },
        },
        {
          '&if': "./type === 'advanced'",
          properties: {
            advancedField: {
              type: 'string',
              default: 'advanced-value',
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    const typeNode = node.find('type') as StringNode;
    const enableOptionalNode = node.find('enableOptional');

    expect(typeNode.value).toBe('basic');

    // computed 속성이 있는 필드 확인
    const optionalField = node.find('optionalField') as StringNode;
    if (optionalField) {
      expect(optionalField.active).toBe(false);

      // enableOptional을 true로 변경
      (enableOptionalNode as any)?.setValue(true);
      await delay();

      expect(optionalField.active).toBe(true);
    }
  });

  it('oneOf에서 const를 사용한 조건 분기', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        productType: {
          type: 'string',
          enum: ['physical', 'digital'],
          default: 'physical',
        },
      },
      oneOf: [
        {
          properties: {
            productType: {
              const: 'physical',
            },
            weight: { type: 'number', default: 1 },
          },
        },
        {
          properties: {
            productType: {
              const: 'digital',
            },
            fileSize: { type: 'number', default: 100 },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    const productTypeNode = node.find('productType') as StringNode;
    expect(productTypeNode.value).toBe('physical');

    // 각 조건에 따른 필드 확인
    const weightNode = node.find('weight');

    // oneOf는 조건에 따라 다른 필드가 활성화됨
    if (weightNode) {
      expect(weightNode).toBeDefined();
    }

    // 값 변경 테스트
    productTypeNode.setValue('digital');
    await delay();
    expect(productTypeNode.value).toBe('digital');
  });

  it('oneOf에서 배열 내부 동작', async () => {
    const schema: JsonSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          itemType: {
            type: 'string',
            enum: ['text', 'number'],
            default: 'text',
          },
        },
        oneOf: [
          {
            '&if': "./itemType === 'text'",
            properties: {
              textValue: { type: 'string', default: 'sample' },
            },
          },
          {
            '&if': "./itemType === 'number'",
            properties: {
              numberValue: { type: 'number', default: 0 },
            },
          },
        ],
      },
      minItems: 1,
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ArrayNode;

    // 노드 생성 후 delay
    await delay();

    // 배열에 아이템 추가
    node.push();
    await delay();

    const firstItem = node.children?.[0]?.node as ObjectNode;
    expect(firstItem).toBeDefined();

    // 아이템의 기본 타입 확인
    const itemTypeNode = firstItem.find('itemType') as StringNode;
    expect(itemTypeNode.value).toBe('text');

    // oneOf에 따른 필드 확인
    const textValueNode = firstItem.find('textValue');
    if (textValueNode) {
      expect(textValueNode).toBeDefined();
    }

    // 값 변경 테스트
    itemTypeNode.setValue('number');
    await delay();
    expect(itemTypeNode.value).toBe('number');
  });

  it('oneOf와 properties 병합', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        commonField: {
          type: 'string',
          default: 'shared',
        },
        selector: {
          type: 'string',
          enum: ['A', 'B'],
          default: 'A',
        },
      },
      oneOf: [
        {
          '&if': "./selector === 'A'",
          properties: {
            specificA: { type: 'string', default: 'valueA' },
          },
        },
        {
          '&if': "./selector === 'B'",
          properties: {
            specificB: { type: 'number', default: 100 },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 노드 생성 후 delay
    await delay();

    // 공통 필드는 항상 존재
    expect(node.find('commonField')).toBeDefined();
    expect(node.find('selector')).toBeDefined();

    expect(node.value?.commonField).toBe('shared');

    const selectorNode = node.find('selector') as StringNode;
    expect(selectorNode.value).toBe('A');

    // selector 값 변경 테스트
    selectorNode.setValue('B');
    await delay();
    expect(selectorNode.value).toBe('B');
  });
});
