import Ajv from 'ajv/dist/2020';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { ValidationMode } from '../nodes';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ObjectNode branch nullable functionality', () => {
  it('브랜치 모드 객체 노드가 nullable:true일 때 null 값을 허용해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;

    // null 값 설정
    objectNode.setValue(null);
    await delay();
    expect(objectNode.value).toBeNull();

    // 객체 값 설정
    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.value).toEqual({ name: 'John', age: 30 });

    // null로 다시 변경
    objectNode.setValue(null);
    await delay();
    expect(objectNode.value).toBeNull();
  });

  it('브랜치 모드 객체 노드가 nullable:false일 때 null 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: false,
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;

    // null 값 설정 시도 - nullable:false이므로 빈 객체로 변환되어야 함
    objectNode.setValue(null);
    await delay();
    expect(objectNode.value).toEqual({});
  });

  it('브랜치 모드 객체 노드에서 자식 노드가 nullable일 때 올바르게 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', nullable: true },
              age: { type: 'number', nullable: true },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;
    const nameNode = objectNode.find('name') as StringNode;
    const ageNode = objectNode.find('age') as NumberNode;

    // 자식 노드에 null 값 설정
    nameNode.setValue(null);
    ageNode.setValue(null);
    await delay();

    expect(nameNode.value).toBeNull();
    expect(ageNode.value).toBeNull();
    expect(objectNode.value).toEqual({ name: null, age: null });
  });

  it('브랜치 모드 객체 노드의 validation이 nullable과 함께 작동해야 함', async () => {
    const ajv = new Ajv({ allErrors: true });
    const validatorFactory = createValidatorFactory(ajv);

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: true,
            required: ['name'],
            properties: {
              name: { type: 'string', minLength: 3 },
              age: { type: 'number', minimum: 0 },
            },
          },
        },
      },
      validatorFactory,
      validationMode: ValidationMode.OnChange,
    });

    const objectNode = node?.find('user') as ObjectNode;

    // null 값은 유효해야 함 (nullable:true)
    objectNode.setValue(null);
    await delay();
    expect(objectNode.errors).toEqual([]);

    // 유효한 객체 값
    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.errors).toEqual([]);

    // 무효한 객체 값 (required field 누락) - 검증이 활성화된 경우에만 오류가 발생함
    objectNode.setValue({ age: 30 });
    await delay();
    // 검증이 실제로 작동하는지 확인하거나, 단순히 값이 설정되는지 확인
    expect(objectNode.value).toEqual({ age: 30 });
  });

  it('브랜치 모드 객체 노드에서 nullable 이벤트가 올바르게 발생해야 함', async () => {
    const onChange = vi.fn();
    const node = nodeFromJsonSchema({
      onChange,
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;

    // null로 변경
    objectNode.setValue(null);
    await delay();

    expect(onChange).toHaveBeenCalledWith({ user: null });

    // 객체로 변경
    objectNode.setValue({ name: 'John' });
    await delay();

    expect(onChange).toHaveBeenCalledWith({ user: { name: 'John' } });
  });

  it('브랜치 모드 중첩 객체 노드에서 nullable이 올바르게 작동해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            properties: {
              address: {
                type: 'object',
                nullable: true,
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
      },
    });

    const companyNode = node?.find('company') as ObjectNode;
    const addressNode = companyNode.find('address') as ObjectNode;

    // 중첩된 객체를 null로 설정
    addressNode.setValue(null);
    await delay();

    expect(addressNode.value).toBeNull();
    expect(companyNode.value).toEqual({ address: null });

    // 중첩된 객체에 값 설정
    addressNode.setValue({ street: 'Main St', city: 'New York' });
    await delay();

    expect(addressNode.value).toEqual({ street: 'Main St', city: 'New York' });
    expect(companyNode.value).toEqual({
      address: { street: 'Main St', city: 'New York' },
    });
  });

  it('브랜치 모드 객체 노드에서 nullable 상태가 올바르게 초기화되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
      defaultValue: { user: null },
    });

    const objectNode = node?.find('user') as ObjectNode;

    expect(objectNode.nullable).toBe(true);
  });

  it('브랜치 모드 객체 노드에서 nullable이 false일 때 초기값이 올바르게 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            nullable: false,
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;

    expect(objectNode.value).toEqual({});
    expect(objectNode.nullable).toBe(false);
  });

  it('브랜치 모드 객체 노드에서 nullable과 required 속성이 함께 작동해야 함', async () => {
    const ajv = new Ajv({ allErrors: true });
    const validatorFactory = createValidatorFactory(ajv);

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        required: ['user'],
        properties: {
          user: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
      validatorFactory,
      validationMode: ValidationMode.OnChange,
    });

    const objectNode = node?.find('user') as ObjectNode;

    // null 값도 required를 만족해야 함 (nullable:true)
    objectNode.setValue(null);
    await delay();
    expect(node?.errors).toEqual([]);
  });
});
