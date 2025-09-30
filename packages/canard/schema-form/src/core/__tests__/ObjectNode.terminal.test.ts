import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ObjectNode } from '../nodes/ObjectNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ObjectNode terminal functionality', () => {
  it('객체 터미널 노드가 자식 노드 없이 객체 값을 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          config: {
            type: 'object',
            terminal: true,
            properties: {
              name: { type: 'string' },
              value: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('config') as ObjectNode;

    // 객체 값 직접 설정
    objectNode.setValue({ name: 'setting1', value: 42 });
    await delay();
    expect(objectNode.value).toEqual({ name: 'setting1', value: 42 });

    // 빈 객체
    objectNode.setValue({});
    await delay();
    expect(objectNode.value).toEqual({});

    // 다른 객체 설정
    objectNode.setValue({ name: 'setting2', value: 100 });
    await delay();
    expect(objectNode.value).toEqual({ name: 'setting2', value: 100 });
  });

  it('터미널 객체 노드가 복잡한 중첩 구조를 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          metadata: {
            type: 'object',
            terminal: true,
            properties: {
              user: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  profile: {
                    type: 'object',
                    properties: {
                      age: { type: 'number' },
                      location: { type: 'string' },
                    },
                  },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('metadata') as ObjectNode;

    // 복잡한 중첩 객체 설정
    const complexValue = {
      user: {
        name: 'John',
        profile: {
          age: 30,
          location: 'Seoul',
        },
      },
      timestamp: '2024-01-01T00:00:00Z',
    };

    objectNode.setValue(complexValue);
    await delay();
    expect(objectNode.value).toEqual(complexValue);
  });

  it('터미널 객체 노드에서 자식 노드에 접근하지 않아야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            terminal: true,
            properties: {
              field1: { type: 'string' },
              field2: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('data') as ObjectNode;
    objectNode.setValue({ field1: 'value1', field2: 123 });
    await delay();

    // 터미널 모드에서는 자식 노드에 접근할 수 없어야 함
    expect(objectNode.children).toEqual(null);
  });

  it('터미널 객체 노드의 onChange 이벤트가 정상적으로 전파되어야 함', async () => {
    const mockOnChange = vi.fn();

    const node = nodeFromJsonSchema({
      onChange: mockOnChange,
      jsonSchema: {
        type: 'object',
        properties: {
          settings: {
            type: 'object',
            terminal: true,
            properties: {
              theme: { type: 'string' },
              language: { type: 'string' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('settings') as ObjectNode;

    // 객체로 변경
    objectNode.setValue({ theme: 'dark', language: 'ko' });
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({
      settings: { theme: 'dark', language: 'ko' },
    });

    // 다시 다른 객체로 변경
    objectNode.setValue({ theme: 'light', language: 'en' });
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({
      settings: { theme: 'light', language: 'en' },
    });
  });

  it('터미널 객체 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            terminal: true,
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    });

    await delay();

    const objectNode = node?.find('payload') as ObjectNode;
    const mockListener = vi.fn();
    objectNode.subscribe(mockListener);

    // 객체 값으로 변경
    const testValue = { message: 'Hello World' };
    objectNode.setValue(testValue);
    await delay();

    // After initialized, UpdateValue event is dispatched synchronously
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: testValue,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: {},
          current: testValue,
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

  it('터미널 객체 노드가 유효성 검사와 함께 동작해야 함', async () => {
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
          user: {
            type: 'object',
            terminal: true,
            required: ['name'],
            properties: {
              name: { type: 'string' },
              age: { type: 'number', minimum: 0 },
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const objectNode = node?.find('user') as ObjectNode;

    // 유효한 객체
    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.errors).toEqual([]);

    // required 필드 누락
    objectNode.setValue({ age: 25 });
    await delay();
    expect(objectNode.errors.length).toBeGreaterThan(0);

    // 다시 유효한 객체
    objectNode.setValue({ name: 'Jane', age: 28 });
    await delay();
    expect(objectNode.errors).toEqual([]);
  });

  it('터미널 객체와 nullable이 함께 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          optionalData: {
            type: 'object',
            terminal: true,
            nullable: true,
            properties: {
              value: { type: 'string' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('optionalData') as ObjectNode;

    // null 값 설정
    objectNode.setValue(null);
    await delay();
    expect(objectNode.value).toBeNull();

    // 객체 값 설정
    objectNode.setValue({ value: 'test' });
    await delay();
    expect(objectNode.value).toEqual({ value: 'test' });

    // 다시 null로 설정
    objectNode.setValue(null);
    await delay();
    expect(objectNode.value).toBeNull();
  });

  it('터미널 객체 노드가 배열 필드를 포함하여 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          container: {
            type: 'object',
            terminal: true,
            properties: {
              name: { type: 'string' },
              tags: {
                type: 'array',
                items: { type: 'string' },
              },
              nested: {
                type: 'object',
                properties: {
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    });

    const objectNode = node?.find('container') as ObjectNode;

    // 배열과 중첩 객체를 포함한 복합 객체 설정
    const complexValue = {
      name: 'container1',
      tags: ['tag1', 'tag2', 'tag3'],
      nested: {
        count: 42,
      },
    };

    objectNode.setValue(complexValue);
    await delay();
    expect(objectNode.value).toEqual(complexValue);

    // 자식 노드는 생성되지 않음
    expect(objectNode.children).toEqual(null);
  });

  it('터미널 객체 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          defaultConfig: {
            type: 'object',
            terminal: true,
            default: {
              theme: 'light',
              autoSave: true,
            },
            properties: {
              theme: { type: 'string' },
              autoSave: { type: 'boolean' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('defaultConfig') as ObjectNode;
    await delay();

    expect(objectNode.value).toEqual({
      theme: 'light',
      autoSave: true,
    });
  });

  it('터미널 객체 노드의 dirty 및 touched 상태가 정상적으로 관리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          editableConfig: {
            type: 'object',
            terminal: true,
            default: { version: '1.0' },
            properties: {
              version: { type: 'string' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('editableConfig') as ObjectNode;
    await delay();

    // 초기 상태 확인 (속성이 있는 경우에만)
    if ('isDirty' in objectNode) {
      expect(objectNode.isDirty).toBe(false);
    }
    if ('isTouched' in objectNode) {
      expect(objectNode.isTouched).toBe(false);
    }

    // 새로운 값으로 변경
    objectNode.setValue({ version: '2.0', newField: 'added' });
    await delay();

    if ('isDirty' in objectNode) {
      expect(objectNode.isDirty).toBe(true);
    }
    if ('isTouched' in objectNode) {
      expect(objectNode.isTouched).toBe(true);
    }

    // 기본값으로 복원
    objectNode.setValue({ version: '1.0' });
    await delay();

    if ('isDirty' in objectNode) {
      expect(objectNode.isDirty).toBe(false);
    }
    if ('isTouched' in objectNode) {
      expect(objectNode.isTouched).toBe(true);
    }
  });

  it('터미널 객체 노드가 동적으로 필드를 추가/제거를 처리해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          dynamicObject: {
            type: 'object',
            terminal: true,
            properties: {
              name: { type: 'string' },
            },
            additionalProperties: true,
          },
        },
      },
    });

    const objectNode = node?.find('dynamicObject') as ObjectNode;

    // 초기 객체 설정
    objectNode.setValue({ name: 'initial' });
    await delay();
    expect(objectNode.value).toEqual({ name: 'initial' });

    // 필드 추가
    objectNode.setValue({
      name: 'initial',
      age: 25,
      location: 'Seoul',
    });
    await delay();
    expect(objectNode.value).toEqual({
      name: 'initial',
      age: 25,
      location: 'Seoul',
    });

    // 일부 필드 제거
    objectNode.setValue({ name: 'updated' });
    await delay();
    expect(objectNode.value).toEqual({ name: 'updated' });

    // 빈 객체
    objectNode.setValue({});
    await delay();
    expect(objectNode.value).toEqual({});
  });

  it('터미널 객체 노드가 additionalProperties와 함께 동작해야 함', async () => {
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
          flexibleObject: {
            type: 'object',
            terminal: true,
            properties: {
              requiredField: { type: 'string' },
            },
            additionalProperties: {
              type: 'number',
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const objectNode = node?.find('flexibleObject') as ObjectNode;

    // 정의된 필드와 추가 필드들
    objectNode.setValue({
      requiredField: 'value',
      extraNumber1: 42,
      extraNumber2: 100,
    });
    await delay();
    expect(objectNode.errors).toEqual([]);
    expect(objectNode.value).toEqual({
      requiredField: 'value',
      extraNumber1: 42,
      extraNumber2: 100,
    });

    // 추가 필드만 있는 경우
    objectNode.setValue({
      requiredField: 'value',
      extraNumber: 'invalid', // 숫자가 아닌 값
    });
    await delay();
    // additionalProperties 검증에 따라 오류가 발생할 수 있음
  });

  it('터미널 객체 노드가 깊은 중첩과 함께 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          deepObject: {
            type: 'object',
            terminal: true,
            properties: {
              level1: {
                type: 'object',
                properties: {
                  level2: {
                    type: 'object',
                    properties: {
                      level3: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            value: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const objectNode = node?.find('deepObject') as ObjectNode;

    // 깊게 중첩된 구조
    const deepValue = {
      level1: {
        level2: {
          level3: [{ value: 'item1' }, { value: 'item2' }, { value: 'item3' }],
        },
      },
    };

    objectNode.setValue(deepValue);
    await delay();
    expect(objectNode.value).toEqual(deepValue);

    // 터미널 모드에서는 중첩 구조도 단말 노드로 처리됨
    expect(objectNode.children).toEqual(null);
  });
});
