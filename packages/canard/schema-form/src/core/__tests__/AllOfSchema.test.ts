import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import { NodeEventType, ValidationMode } from '../nodes';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('AllOf Schema', () => {
  it('기본 allOf 스키마가 정상적으로 병합되어야 함', () => {
    const jsonSchema = {
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
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    expect(node).toBeDefined();
    expect(node?.type).toBe('object');

    const nameNode = node?.find('name') as StringNode;
    const ageNode = node?.find('age') as NumberNode;

    expect(nameNode).toBeDefined();
    expect(nameNode?.type).toBe('string');
    expect(ageNode).toBeDefined();
    expect(ageNode?.type).toBe('number');
  });

  it('allOf 스키마의 값이 정상적으로 설정되어야 함', async () => {
    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            firstName: { type: 'string' },
          },
        },
        {
          properties: {
            lastName: { type: 'string' },
          },
        },
        {
          properties: {
            age: { type: 'number' },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    const objectNode = node as ObjectNode;
    expect(objectNode.value).toEqual({});

    objectNode.setValue({ firstName: 'John', lastName: 'Doe', age: 30 });
    await delay();
    expect(objectNode.value).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    });
  });

  it('allOf 스키마의 required 속성이 정상적으로 병합되어야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );

    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            firstName: { type: 'string' },
          },
          required: ['firstName'],
        },
        {
          properties: {
            lastName: { type: 'string' },
          },
          required: ['lastName'],
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const objectNode = node as ObjectNode;
    const firstNameNode = objectNode.find('#/firstName') as StringNode;
    const lastNameNode = objectNode.find('#/lastName') as StringNode;

    objectNode.setValue({ firstName: 'John' });
    await delay();

    expect(firstNameNode.errors).toEqual([]);
    expect(lastNameNode.errors.length).toBeGreaterThan(0);
    expect(lastNameNode.errors.map(({ keyword }) => keyword)).toEqual([
      'required',
    ]);
  });

  it('allOf 스키마의 validation 규칙이 정상적으로 병합되어야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );

    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
          },
        },
        {
          properties: {
            email: {
              minLength: 5,
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const objectNode = node as ObjectNode;
    const emailNode = objectNode.find('#/email') as StringNode;

    objectNode.setValue({ email: 'a@b' });
    await delay();

    expect(emailNode.errors.length).toBeGreaterThan(0);
    expect(emailNode.errors.map(({ keyword }) => keyword)).toContain(
      'minLength',
    );

    objectNode.setValue({ email: 'valid@email.com' });
    await delay();

    expect(emailNode.errors).toEqual([]);
  });

  it('중첩된 allOf 스키마가 정상적으로 처리되어야 함', () => {
    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            user: {
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
                  },
                },
              ],
            },
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
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    const userNode = node?.find('user') as ObjectNode;
    const addressNode = node?.find('address') as ObjectNode;
    const nameNode = userNode?.find('name') as StringNode;
    const ageNode = userNode?.find('age') as NumberNode;
    const streetNode = addressNode?.find('street') as StringNode;

    expect(userNode).toBeDefined();
    expect(addressNode).toBeDefined();
    expect(nameNode).toBeDefined();
    expect(ageNode).toBeDefined();
    expect(streetNode).toBeDefined();
  });

  it('allOf 스키마의 기본값이 정상적으로 병합되어야 함', async () => {
    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            firstName: {
              type: 'string',
              default: 'John',
            },
          },
        },
        {
          properties: {
            lastName: {
              type: 'string',
              default: 'Doe',
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    const objectNode = node as ObjectNode;
    await delay();

    expect(objectNode.value).toEqual({ firstName: 'John', lastName: 'Doe' });
  });

  it('allOf 스키마와 기본 properties가 정상적으로 병합되어야 함', () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      allOf: [
        {
          properties: {
            name: { type: 'string' },
          },
        },
        {
          properties: {
            email: { type: 'string' },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    const idNode = node?.find('id') as NumberNode;
    const nameNode = node?.find('name') as StringNode;
    const emailNode = node?.find('email') as StringNode;

    expect(idNode).toBeDefined();
    expect(nameNode).toBeDefined();
    expect(emailNode).toBeDefined();
  });

  it('allOf 스키마의 additionalProperties가 정상적으로 병합되어야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );

    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            name: { type: 'string' },
          },
          additionalProperties: false,
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const objectNode = node as ObjectNode;

    objectNode.setValue({ name: 'John', extra: 'value' });
    await delay();

    expect(objectNode.errors.length).toBeGreaterThan(0);
    expect(objectNode.errors.map(({ keyword }) => keyword)).toContain(
      'additionalProperties',
    );
  });

  it('allOf 스키마의 이벤트가 정상적으로 발생해야 함', async () => {
    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            firstName: { type: 'string' },
          },
        },
        {
          properties: {
            lastName: { type: 'string' },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    await delay();

    const objectNode = node as ObjectNode;
    const mockListener = vi.fn();
    objectNode.subscribe(mockListener);

    objectNode.setValue({ firstName: 'John', lastName: 'Doe' });
    await delay();

    expect(mockListener).toHaveBeenCalledWith({
      type:
        NodeEventType.UpdateValue |
        NodeEventType.RequestRefresh |
        NodeEventType.UpdateComputedProperties,
      payload: {
        [NodeEventType.UpdateValue]: { firstName: 'John', lastName: 'Doe' },
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: { firstName: 'John', lastName: 'Doe' },
          previous: {},
          settled: false,
        },
      },
    });
  });

  it('복잡한 allOf 스키마가 정상적으로 처리되어야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );

    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            personalInfo: {
              type: 'object',
              properties: {
                firstName: { type: 'string', minLength: 1 },
                lastName: { type: 'string', minLength: 1 },
              },
              required: ['firstName', 'lastName'],
            },
          },
        },
        {
          properties: {
            contactInfo: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                phone: { type: 'string', pattern: '^[0-9-]+$' },
              },
              required: ['email'],
            },
          },
        },
        {
          properties: {
            preferences: {
              type: 'object',
              properties: {
                newsletter: { type: 'boolean', default: false },
                theme: {
                  type: 'string',
                  enum: ['light', 'dark'],
                  default: 'light',
                },
              },
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    await delay();

    const objectNode = node as ObjectNode;
    const personalInfoNode = objectNode.find('personalInfo') as ObjectNode;
    const contactInfoNode = objectNode.find('contactInfo') as ObjectNode;
    const preferencesNode = objectNode.find('preferences') as ObjectNode;

    expect(personalInfoNode).toBeDefined();
    expect(contactInfoNode).toBeDefined();
    expect(preferencesNode).toBeDefined();

    expect(preferencesNode.value).toEqual({
      newsletter: false,
      theme: 'light',
    });

    objectNode.setValue({
      personalInfo: { firstName: 'John', lastName: 'Doe' },
      contactInfo: { email: 'john@example.com', phone: '123-456-7890' },
      preferences: { newsletter: true, theme: 'dark' },
    });
    await delay();

    expect(objectNode.errors).toEqual([]);
    expect(objectNode.value).toEqual({
      personalInfo: { firstName: 'John', lastName: 'Doe' },
      contactInfo: { email: 'john@example.com', phone: '123-456-7890' },
      preferences: { newsletter: true, theme: 'dark' },
    });
  });

  it('allOf 스키마의 computed 속성이 정상적으로 작동해야 함', async () => {
    const jsonSchema = {
      type: 'object',
      allOf: [
        {
          properties: {
            firstName: { type: 'string' },
          },
        },
        {
          properties: {
            lastName: { type: 'string' },
          },
        },
        {
          properties: {
            fullName: {
              type: 'string',
              computed: {
                visible: '../firstName && ../lastName',
              },
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema,
    });

    await delay();

    const objectNode = node as ObjectNode;
    const fullNameNode = objectNode.find('fullName') as StringNode;

    expect(fullNameNode.visible).toBe(false);

    objectNode.setValue({ firstName: 'John' });
    await delay();

    expect(fullNameNode.visible).toBe(false);

    objectNode.setValue({ firstName: 'John', lastName: 'Doe' });
    await delay();

    expect(fullNameNode.visible).toBe(true);
  });
});
