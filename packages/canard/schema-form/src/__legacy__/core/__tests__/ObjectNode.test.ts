import Ajv from 'ajv/dist/2020';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('ObjectNode', () => {
  it('객체 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
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
    const node = nodeFromJSONSchema({
      onChange: () => {},
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
    expect(objectNode.value).toEqual({});

    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.value).toEqual({ name: 'John', age: 30 });
  });

  it('객체 노드의 값이 정상적으로 설정되어야 함: terminal', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            terminal: true,
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
      },
    });

    const objectNode = node?.find('user') as ObjectNode;
    expect(objectNode.value).toEqual({});

    objectNode.setValue({ name: 'John', age: 30 });
    await delay();
    expect(objectNode.value).toEqual({ name: 'John', age: 30 });
  });

  it('객체 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
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

  it('객체 노드의 기본값이 정상적으로 설정되어야 함: terminal', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            terminal: true,
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
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: {
                type: 'number',
                computed: { visible: '../name === "Ron"' },
              },
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

    // After initialized, UpdateValue event is dispatched synchronously
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type:
        NodeEventType.UpdateValue |
        NodeEventType.RequestRefresh |
        NodeEventType.UpdateComputedProperties,
      payload: {
        [NodeEventType.UpdateValue]: { name: 'Ron', age: 28 },
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: { name: 'Ron', age: 28 },
          previous: {},
          settled: false,
          inject: true,
        },
      },
    });
  });

  it('객체 노드의 자식 노드 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
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

    const objectNode = node?.find('/user') as ObjectNode;
    const nameNode = objectNode.find('./name');
    const ageNode = objectNode.find('./age');

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
    const node = nodeFromJSONSchema({
      onChange: () => {},
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

    const objectNode = node?.find('/user') as ObjectNode;
    const nameNode = objectNode.find('./name');

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
          previous: {},
          settled: true,
          inject: true,
        },
      },
    });
  });

  it('객체 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );
    const node = nodeFromJSONSchema({
      onChange: () => {},
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
      validatorFactory,
    });

    await delay();
    const objectNode = node?.find('/user') as ObjectNode;
    const userNameNode = objectNode.find('#/user/name') as StringNode;
    const userAgeNode = objectNode.find('#/user/age') as NumberNode;

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
    const node = nodeFromJSONSchema({
      onChange: () => {},
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

  it('객체 노드의 추가 속성이 허용되지 않아야 함(자동 필터링)', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );
    const node = nodeFromJSONSchema({
      onChange: () => {},
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
      validatorFactory,
    });

    const objectNode = node?.find('/user') as ObjectNode;
    await delay();

    // 추가 속성이 있는 값 설정
    objectNode.setValue({ name: 'John', age: 30, email: 'hong@example.com' });
    await delay();
    expect(objectNode.errors.length).toBe(0);
    expect(objectNode.value).toEqual({
      name: 'John',
      age: 30,
    });
  });

  it('객체 노드의 추가 속성이 허용되지 않아야 함, 객체 내부에 additionalProperties 속성이 있는 경우', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );
    const node = nodeFromJSONSchema({
      onChange: () => {},
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
      validatorFactory,
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

    expect(node.value).toEqual({
      users: [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
        },
        {
          id: 3,
          name: 'User 3',
          email: 'user3@example.com',
        },
      ],
    });

    const arrayNode = node?.find('/users') as ArrayNode;
    expect(arrayNode.value).toEqual([
      {
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
      },
      {
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
      },
      {
        id: 3,
        name: 'User 3',
        email: 'user3@example.com',
      },
    ]);
    const childNodes = arrayNode.children;
    expect(childNodes?.length).toBe(3);

    childNodes?.forEach(({ node }, index) => {
      expect(node.value).toEqual({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
      });
      expect(node.errors).toEqual([]);
      expect(node.errors.length).toBe(0);
    });
  });

  it('객체 노드의 추가 속성 제한이 없으면 추가 속성이 허용되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
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

    const objectNode = node?.find('/user') as ObjectNode;
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
    } satisfies JSONSchema;

    const node = nodeFromJSONSchema({
      jsonSchema,
      onChange: () => {},
    });
    await delay();

    const root = node.find('/root') as ObjectNode;
    expect(root.jsonSchema).toEqual(jsonSchema.$defs.TreeNode);

    const children = node.find('#/root/children') as ArrayNode;

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

    const firstChild = node.find('#/root/children/0') as ObjectNode;
    expect(firstChild.value).toEqual({
      id: '4',
      name: 'User 4',
    });
    expect(firstChild.jsonSchema).toEqual(jsonSchema.$defs.TreeNode);
  });

  it('oneOf schema는 properties 속성을 재정의할 수 없음', async () => {
    const jsonSchema = {
      type: 'object',
      oneOf: [
        {
          '&if': "(../category)==='movie'",
          properties: {
            category: {
              type: 'string',
              format: 'date',
              '&visible': '../title === "wow"',
            },
            title: {
              type: 'number',
              minimum: 50,
            },
          },
        },
        {
          '&if': "(../category)==='game'",
          properties: {
            date2: {
              type: 'string',
              format: 'date',
              '&visible': '../title === "wow"',
            },
            price2: { type: 'number' },
          },
        },
      ],
      properties: {
        category: {
          type: 'string',
          enum: ['game', 'movie'],
          default: 'game',
        },
        title: { type: 'string' },
      },
    } satisfies JSONSchema;

    expect(() =>
      nodeFromJSONSchema({
        jsonSchema,
        onChange: () => {},
      }),
    ).toThrowError("Property redefinition not allowed in 'oneOf' schema.");
  });

  it('oneOf schema는 properties 속성을 재정의할 수 없음, 단, 부모와 동일한 타입은 허용됨', async () => {
    const jsonSchema = {
      type: 'object',
      oneOf: [
        {
          '&if': "(./category)==='movie'",
          type: 'object', // 부모와 같은 타입은 허용됨
          properties: {
            date1: {
              type: 'string',
              format: 'date',
              '&visible': '../title === "wow"',
            },
            price1: {
              type: 'number',
              minimum: 50,
            },
          },
        },
        {
          '&if': "(./category)==='game'",
          type: 'string', // 부모와 다른 타입은 허용되지 않음
        },
      ],
      properties: {
        category: {
          type: 'string',
          enum: ['game', 'movie'],
          default: 'game',
        },
        title: { type: 'string' },
      },
    } satisfies JSONSchema;

    expect(() =>
      nodeFromJSONSchema({
        jsonSchema,
        onChange: () => {},
      }),
    ).toThrowError("Type redefinition not allowed in 'oneOf' schema.");
  });

  describe('극단적인 키를 사용한 ObjectNode 기능 테스트', () => {
    it('극단적인 키로 객체 노드의 값이 정상적으로 설정되어야 함', async () => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            '🚀user@email.com': {
              type: 'object',
              properties: {
                '사용자이름-Japanese日本語': { type: 'string' },
                'age:$number': { type: 'number' },
              },
            },
          },
        },
      });

      const objectNode = node?.find('🚀user@email.com') as ObjectNode;
      expect(objectNode.value).toEqual({});

      objectNode.setValue({
        '사용자이름-Japanese日本語': 'John',
        'age:$number': 30,
      });
      await delay();
      expect(objectNode.value).toEqual({
        '사용자이름-Japanese日本語': 'John',
        'age:$number': 30,
      });
    });

    it('극단적인 키로 객체 노드의 기본값이 정상적으로 설정되어야 함', async () => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            'api/v2/users/:id': {
              type: 'object',
              properties: {
                中文键名: { type: 'string' },
                '550e8400-e29b-41d4-a716-446655440000': { type: 'number' },
              },
              default: {
                中文键名: 'Lee',
                '550e8400-e29b-41d4-a716-446655440000': 25,
              },
            },
          },
        },
      });

      const objectNode = node?.find('/api~1v2~1users~1:id') as ObjectNode;
      await delay();
      expect(objectNode.value).toEqual({
        中文键名: 'Lee',
        '550e8400-e29b-41d4-a716-446655440000': 25,
      });
    });

    it('극단적인 키로 객체 노드의 자식 노드 값이 정상적으로 설정되어야 함', async () => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            mixed混合język: {
              type: 'object',
              properties: {
                'C:\\Users\\Documents': { type: 'string' },
                '~/.config/settings.json': { type: 'number' },
              },
            },
          },
        },
      });

      const objectNode = node?.find('/mixed混合język') as ObjectNode;
      const nameNode = objectNode.find('C:\\Users\\Documents');
      const ageNode = objectNode.find('~0~1.config~1settings.json');

      expect(nameNode).toBeDefined();
      expect(ageNode).toBeDefined();

      // @ts-expect-error
      nameNode?.setValue('John');
      // @ts-expect-error
      ageNode?.setValue(30);
      await delay();

      expect(objectNode.value).toEqual({
        'C:\\Users\\Documents': 'John',
        '~/.config/settings.json': 30,
      });
    });

    it('극단적인 키로 객체 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
      const validatorFactory = createValidatorFactory(
        new Ajv({
          allErrors: true,
          strictSchema: false,
          validateFormats: false,
        }),
      );
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            'user사용자@domain.com': {
              type: 'object',
              properties: {
                '👨‍👩‍👧‍👦family': { type: 'string', minLength: 2 },
                'v1.2.3-beta+build': {
                  type: 'number',
                  minimum: 0,
                  maximum: 120,
                },
              },
              required: ['👨‍👩‍👧‍👦family', 'v1.2.3-beta+build'],
            },
          },
        },
        validationMode: ValidationMode.OnChange,
        validatorFactory,
      });

      await delay();
      const objectNode = node?.find('/user사용자@domain.com') as ObjectNode;
      const userNameNode = objectNode.find(
        '#/user사용자@domain.com/👨‍👩‍👧‍👦family',
      ) as StringNode;
      const userAgeNode = objectNode.find(
        '#/user사용자@domain.com/v1.2.3-beta+build',
      ) as NumberNode;

      objectNode.setValue({ '👨‍👩‍👧‍👦family': 'J' });
      await delay();
      expect(userAgeNode.errors.length).toBeGreaterThan(0);
      expect(userAgeNode.errors.map(({ keyword }) => keyword)).toEqual([
        'required',
      ]);

      objectNode.setValue({ '👨‍👩‍👧‍👦family': 'John', 'v1.2.3-beta+build': 30 });
      await delay();
      expect(objectNode.errors).toEqual([]);

      objectNode.setValue({ '👨‍👩‍👧‍👦family': '홍', 'v1.2.3-beta+build': 150 });
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

    it('극단적인 키로 객체 노드의 추가 속성이 허용되어야 함', async () => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            'hello世界🌍': {
              type: 'object',
              properties: {
                'api.v1.endpoint': { type: 'string' },
                'kebab-case-key': { type: 'number' },
              },
              additionalProperties: true,
            },
          },
        },
      });

      const objectNode = node?.find('hello世界🌍') as ObjectNode;
      await delay();

      objectNode.setValue({
        'api.v1.endpoint': 'John',
        'kebab-case-key': 30,
        'email@example.com': 'hong@example.com',
      });
      await delay();
      expect(objectNode.errors).toEqual([]);
      expect(objectNode.value).toEqual({
        'api.v1.endpoint': 'John',
        'kebab-case-key': 30,
        'email@example.com': 'hong@example.com',
      });
    });

    it('극단적인 키로 객체 노드의 이벤트가 정상적으로 발생해야 함', async () => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            'endpoint/api/v2:users:POST': {
              type: 'object',
              properties: {
                'ünicøde-näme': { type: 'string' },
                пользователь: { type: 'number' },
              },
            },
          },
        },
      });

      await delay();

      const objectNode = node?.find(
        'endpoint~1api~1v2:users:POST',
      ) as ObjectNode;

      const mockListener = vi.fn();
      objectNode.subscribe(mockListener);

      objectNode.setValue({ 'ünicøde-näme': 'Ron', пользователь: 28 });
      await delay();

      // After initialized, parent setValue with Isolate option causes events to merge
      expect(mockListener).toHaveBeenNthCalledWith(1, {
        type:
          NodeEventType.UpdateValue |
          NodeEventType.RequestRefresh |
          NodeEventType.UpdateComputedProperties,
        payload: {
          [NodeEventType.UpdateValue]: {
            'ünicøde-näme': 'Ron',
            пользователь: 28,
          },
        },
        options: {
          [NodeEventType.UpdateValue]: {
            current: { 'ünicøde-näme': 'Ron', пользователь: 28 },
            previous: {},
            settled: false,
            inject: true,
          },
        },
      });
    });
  });
});
