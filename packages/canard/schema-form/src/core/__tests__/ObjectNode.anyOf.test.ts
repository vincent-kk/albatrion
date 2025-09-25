import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ObjectNode anyOf', () => {
  it('anyOf 기본 동작 확인', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['personal', 'business'],
          default: 'personal',
        },
      },
      anyOf: [
        {
          '&if': "./type === 'personal'",
          properties: {
            hobby: {
              type: 'string',
              default: 'reading',
            },
          },
        },
        {
          '&if': "./type === 'business'",
          properties: {
            company: {
              type: 'string',
              default: 'TechCorp',
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

    // anyOf는 모든 스키마가 병합되어 사용 가능할 수 있음
    expect(node.find('type')).toBeDefined();

    // 기본적인 동작 확인
    const typeNode = node.find('type') as StringNode;
    expect(typeNode.value).toBe('personal');

    // 값 변경 테스트
    typeNode.setValue('business');
    await delay();
    expect(typeNode.value).toBe('business');
  });

  it('anyOf의 기본 스키마 병합', async () => {
    const schema: JsonSchema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            name: { type: 'string' },
          },
        },
        {
          properties: {
            age: { type: 'number' },
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

    // anyOf에서 정의된 모든 속성이 사용 가능해야 함
    expect(node.find('name')).toBeDefined();
    expect(node.find('age')).toBeDefined();

    // 각 필드에 개별적으로 값 설정
    const nameNode = node.find('name') as StringNode;
    const ageNode = node.find('age') as NumberNode;

    nameNode.setValue('John');
    await delay();

    ageNode.setValue(30);
    await delay();

    // anyOf에서는 모든 속성이 활성화될 수 있음
    expect(node.value?.name).toBe('John');
    expect(node.value?.age).toBe(30);
  });

  it('anyOf와 properties 병합', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        common: { type: 'string', default: 'shared' },
      },
      anyOf: [
        {
          properties: {
            specific1: { type: 'string' },
          },
        },
        {
          properties: {
            specific2: { type: 'number' },
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

    // properties와 anyOf의 속성들이 모두 존재해야 함
    expect(node.find('common')).toBeDefined();
    expect(node.find('specific1')).toBeDefined();
    expect(node.find('specific2')).toBeDefined();

    expect(node.value?.common).toBe('shared');
  });
});
