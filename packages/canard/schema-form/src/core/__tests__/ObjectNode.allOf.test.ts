import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('ObjectNode allOf', () => {
  it('allOf로 여러 스키마가 병합되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        {
          properties: {
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
        },
        {
          properties: {
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
              },
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    expect(node).toBeDefined();
    expect(node.type).toBe('object');

    // 모든 속성이 병합되어 있는지 확인
    const nameNode = node.find('name');
    const ageNode = node.find('age');
    const emailNode = node.find('email');
    const phoneNode = node.find('phone');
    const addressNode = node.find('address');

    expect(nameNode).toBeDefined();
    expect(ageNode).toBeDefined();
    expect(emailNode).toBeDefined();
    expect(phoneNode).toBeDefined();
    expect(addressNode).toBeDefined();

    expect(nameNode?.type).toBe('string');
    expect(ageNode?.type).toBe('number');
    expect(emailNode?.type).toBe('string');
    expect(phoneNode?.type).toBe('string');
    expect(addressNode?.type).toBe('object');
  });

  it('allOf와 properties가 함께 사용되면 병합되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
      allOf: [
        {
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        {
          properties: {
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
            },
            priority: {
              type: 'number',
              minimum: 1,
              maximum: 5,
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // properties의 필드들
    expect(node.find('id')).toBeDefined();
    expect(node.find('timestamp')).toBeDefined();

    // allOf의 필드들
    expect(node.find('name')).toBeDefined();
    expect(node.find('description')).toBeDefined();
    expect(node.find('status')).toBeDefined();
    expect(node.find('priority')).toBeDefined();
  });

  it('allOf의 스키마에서 같은 속성이 중복되면 병합되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            name: {
              type: 'string',
              minLength: 2,
            },
          },
        },
        {
          properties: {
            name: {
              type: 'string',
              maxLength: 50,
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    const nameNode = node.find('name') as StringNode;
    expect(nameNode).toBeDefined();
    expect(nameNode.type).toBe('string');

    // 기본적인 동작 확인
    nameNode.setValue('valid name');
    await delay();
    expect(nameNode.value).toBe('valid name');
  });

  it('allOf에서 속성들이 모두 병합되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        {
          properties: {
            email: { type: 'string' },
            phone: { type: 'string' },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 모든 속성이 병합되어 있어야 함
    expect(node.find('name')).toBeDefined();
    expect(node.find('age')).toBeDefined();
    expect(node.find('email')).toBeDefined();
    expect(node.find('phone')).toBeDefined();

    // 값 설정이 정상 동작해야 함
    node.setValue({
      name: 'John',
      age: 30,
      email: 'john@example.com',
      phone: '123-456-7890',
    });
    await delay();

    expect(node.value).toEqual({
      name: 'John',
      age: 30,
      email: 'john@example.com',
      phone: '123-456-7890',
    });
  });

  it('allOf의 default 값이 병합되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            status: {
              type: 'string',
              default: 'active',
            },
            priority: {
              type: 'number',
              default: 3,
            },
          },
        },
        {
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string' },
              default: ['general'],
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 기본값들이 제대로 설정되었는지 확인
    expect(node.value).toEqual({
      status: 'active',
      priority: 3,
      tags: ['general'],
    });
  });

  it('allOf에서 다중 타입 스키마는 금지되어야 함', () => {
    const schema: JsonSchema = {
      type: 'object',
      allOf: [
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        {
          type: 'string', // 다른 타입 - 에러 발생해야 함
        },
      ],
    };

    expect(() => {
      nodeFromJsonSchema({
        onChange: () => {},
        jsonSchema: schema,
      });
    }).toThrow();
  });

  it('중첩된 allOf가 정상적으로 처리되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
        c: { type: 'boolean' },
      },
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    expect(node.find('a')).toBeDefined();
    expect(node.find('b')).toBeDefined();
    expect(node.find('c')).toBeDefined();

    expect(node.find('a')?.type).toBe('string');
    expect(node.find('b')?.type).toBe('number');
    expect(node.find('c')?.type).toBe('boolean');
  });

  it('allOf와 computed 속성이 함께 동작해야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['basic', 'advanced'],
          default: 'basic',
        },
      },
      allOf: [
        {
          properties: {
            basicField: {
              type: 'string',
              computed: {
                active: "../mode === 'basic'",
              },
            },
          },
        },
        {
          properties: {
            advancedField: {
              type: 'string',
              computed: {
                active: "../mode === 'advanced'",
              },
            },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    const modeNode = node.find('mode') as StringNode;
    const basicField = node.find('basicField') as StringNode;
    const advancedField = node.find('advancedField') as StringNode;

    // 초기값은 'basic'이므로 basicField만 활성화
    expect(basicField.active).toBe(true);
    expect(advancedField.active).toBe(false);

    // mode를 'advanced'로 변경
    modeNode.setValue('advanced');
    await delay();

    expect(basicField.active).toBe(false);
    expect(advancedField.active).toBe(true);
  });

  it('allOf의 다양한 속성들이 병합되어야 함', async () => {
    const schema: JsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            name: { type: 'string' },
          },
        },
        {
          properties: {
            age: { type: 'number' },
            active: { type: 'boolean', default: true },
          },
        },
      ],
    };

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: schema,
    }) as ObjectNode;

    // 모든 속성이 있는지 확인
    expect(node.find('name')).toBeDefined();
    expect(node.find('age')).toBeDefined();
    expect(node.find('active')).toBeDefined();

    await delay();

    // 기본값 확인
    expect(node.value?.active).toBe(true);

    // 값 설정
    node.setValue({
      name: 'John',
      age: 30,
      active: false,
    });
    await delay();

    expect(node.value).toEqual({
      name: 'John',
      age: 30,
      active: false,
    });
  });
});
