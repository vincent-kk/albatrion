import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import { NodeEventType, ValidationMode } from '../nodes';
import { ArrayNode } from '../nodes/ArrayNode';
import { NumberNode } from '../nodes/NumberNode';
import { ObjectNode } from '../nodes/ObjectNode';
import { StringNode } from '../nodes/StringNode';

describe('ObjectNode', () => {
  it('객체 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user');
    expect(objectNode).toBeDefined();
    expect(objectNode?.type).toBe('object');
  });

  it('객체 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;
    expect(objectNode.value).toEqual(undefined);

    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.value).toEqual({ name: 'John', age: 30 });
  });

  it('객체 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            default: { name: 'Lee', age: 25 },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;
    await delay();
    expect(objectNode.value).toEqual({ name: 'Lee', age: 25 });
  });

  it('객체 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    await delay();

    const objectNode = node?.find('user') as ObjectNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    objectNode.subscribe(mockListener);

    // 값 변경
    objectNode.setValue({ name: 'Ron', age: 28 });
    await delay();

    // 이벤트가 발생했는지 확인
    expect(mockListener).toHaveBeenCalledWith({
      type: NodeEventType.UpdateValue | NodeEventType.Refresh,
      payload: {
        [NodeEventType.UpdateValue]: { name: 'Ron', age: 28 },
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: { name: 'Ron', age: 28 },
          previous: undefined,
        },
      },
    });
  });

  it('객체 노드의 자식 노드 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;
    const nameNode = objectNode.find('name');
    const ageNode = objectNode.find('age');

    expect(nameNode).toBeDefined();
    expect(ageNode).toBeDefined();

    // 자식 노드 값 설정
    // @ts-expect-error
    nameNode?.setValue('John');
    // @ts-expect-error
    ageNode?.setValue(30);
    await delay();

    // 부모 노드 값 확인
    expect(objectNode.value).toEqual({ name: 'John', age: 30 });
  });

  it('객체 노드의 자식 노드 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });
    await delay();

    const objectNode = node?.find('user') as ObjectNode;
    const nameNode = objectNode.find('name');

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    objectNode.subscribe(mockListener);

    // 자식 노드 값 변경
    // @ts-expect-error
    nameNode?.setValue('John');
    await delay();

    // 부모 노드에 이벤트가 발생했는지 확인
    expect(mockListener).toHaveBeenCalledWith({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: { name: 'John' },
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: { name: 'John' },
        },
      },
    });
  });

  it('객체 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2 },
              age: { type: 'number', minimum: 0, maximum: 120 },
            },
            required: ['name', 'age'],
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    await delay();
    const objectNode = node?.find('user') as ObjectNode;
    const userNameNode = objectNode.find('$.user.name') as StringNode;
    const userAgeNode = objectNode.find('$.user.age') as NumberNode;

    // 필수 속성이 없는 경우, 필수 속성 누락 여부는 개별 항목에게 에러가 전달됨
    objectNode.setValue({ name: 'J' });
    await delay();
    expect(userAgeNode.errors.length).toBeGreaterThan(0);
    expect(userAgeNode.errors.map(({ keyword }) => keyword)).toEqual([
      'required',
    ]);

    // 유효한 값 설정
    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.errors).toEqual([]);

    // 유효하지 않은 값 설정
    objectNode.setValue({ name: '홍', age: 150 });
    await delay();
    expect(userNameNode.errors.length).toBeGreaterThan(0);
    expect(userNameNode.errors.map(({ keyword }) => keyword)).toEqual([
      'minLength',
    ]);
    expect(userAgeNode.errors.length).toBeGreaterThan(0);
    expect(userAgeNode.errors.map(({ keyword }) => keyword)).toEqual([
      'maximum',
    ]);
  });

  it('객체 노드의 추가 속성이 허용되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            additionalProperties: true,
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;
    await delay();

    // 추가 속성이 있는 값 설정
    objectNode.setValue({ name: 'John', age: 30, email: 'hong@example.com' });
    await delay();
    expect(objectNode.errors).toEqual([]);
    expect(objectNode.value).toEqual({
      name: 'John',
      age: 30,
      email: 'hong@example.com',
    });
  });

  it('객체 노드의 추가 속성이 허용되지 않아야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            additionalProperties: false,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    const objectNode = node?.find('user') as ObjectNode;
    await delay();

    // 추가 속성이 있는 값 설정
    objectNode.setValue({ name: 'John', age: 30, email: 'hong@example.com' });
    await delay();
    expect(objectNode.errors.length).toBe(1);
    expect(objectNode.errors.map(({ keyword }) => keyword)).toEqual([
      'additionalProperties',
    ]);
  });

  it('객체 노드의 추가 속성이 허용되지 않아야 함, 객체 내부에 additionalProperties 속성이 있는 경우', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
              additionalProperties: false,
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });
    await delay();

    node.setValue({
      users: [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          extra: 'extra1',
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          extra: 'extra2',
        },
        {
          id: 3,
          name: 'User 3',
          email: 'user3@example.com',
          extra: 'extra3',
        },
      ],
    });

    await delay();

    const arrayNode = node?.find('users') as ArrayNode;
    const childNodes = arrayNode.children;
    expect(childNodes.length).toBe(3);
    childNodes.forEach(({ node }, index) => {
      expect(node.value).toEqual({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        extra: `extra${index + 1}`,
      });
      expect(node.errors.length).toBe(1);
      expect(node.errors.map(({ keyword }) => keyword)).toEqual([
        'additionalProperties',
      ]);
    });
  });

  it('객체 노드의 추가 속성 제한이 없으면 추가 속성이 허용되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    const objectNode = node?.find('user') as ObjectNode;
    await delay();

    // 추가 속성이 있는 값 설정
    objectNode.setValue({ name: 'John', age: 30, email: 'hong@example.com' });
    await delay();
    expect(objectNode.errors).toEqual([]);
    expect(objectNode.value).toEqual({
      name: 'John',
      age: 30,
      email: 'hong@example.com',
    });
  });

  it('객체 노드의 jsonSchema 참조가 정상적으로 동작해야 함', async () => {
    const jsonSchema = {
      title: 'Tree Schema with $defs',
      type: 'object',
      properties: {
        root: {
          $ref: '#/$defs/TreeNode',
        },
      },
      required: ['root'],
      $defs: {
        TreeNode: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/$defs/TreeNode',
              },
            },
          },
          required: ['id', 'name'],
          additionalProperties: false,
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
    });
    await delay();

    const root = node.find('root') as ObjectNode;
    expect(root.jsonSchema).toEqual(jsonSchema.$defs.TreeNode);

    const children = node.find('root.children') as ArrayNode;

    expect(children.jsonSchema).toEqual({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          children: {
            type: 'array',
            items: {
              $ref: '#/$defs/TreeNode',
            },
          },
        },
        required: ['id', 'name'],
        additionalProperties: false,
      },
    });

    children.push({
      id: '4',
      name: 'User 4',
      children: [],
    });
    await delay();

    const firstChild = node.find('root.children.0') as ObjectNode;
    expect(firstChild.value).toEqual({
      id: '4',
      name: 'User 4',
    });
    expect(firstChild.jsonSchema).toEqual(jsonSchema.$defs.TreeNode);
  });
});
