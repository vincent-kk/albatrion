// import { waitFor } from '@testing-library/react';
import Ajv from 'ajv';
import { expect, test } from 'vitest';

import { nodeFromJsonSchema } from '@lumy/schema-form/core';

const wait = (delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

test('node.findNode', () => {
  const node = nodeFromJsonSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        house: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'Gryffindor' },
            founder: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'Godric Gryffindor' },
                yearOfBirth: { type: 'number', default: 900 },
              },
            },
          },
        },
      },
    },
  });

  const founder = node?.findNode('house.founder');
  const founderName = founder?.findNode('name');
  expect(founder?.value).toMatchObject({ name: 'Godric Gryffindor' });
  expect(node?.findNode('house.founder.name')).toBe(founderName);
  // find a relative node
  const founderBirthOfYear1 = founderName?.findNode('@.yearOfBirth');
  expect(founderBirthOfYear1?.value).toBe(900);
  // find a absolute node
  const founderBirthOfYear2 = founderName?.findNode(
    '$.house.founder.yearOfBirth',
  );
  expect(founderBirthOfYear2?.value).toBe(900);
});

test('validate', async () => {
  const node = nodeFromJsonSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          maxLength: 5,
          pattern: '^[^A-Z]*$',
          default: 'Ron Weasley',
        },
      },
    },
  });
  await wait();

  const name = node?.findNode('name');
  expect((name?.errors || []).map(({ keyword }) => keyword)).toMatchObject([
    'maxLength',
    'pattern',
  ]);
  if (name && name.type === 'string') {
    name.setValue('ron weasley');
    await wait();
    expect((name.errors || []).map(({ keyword }) => keyword)).toMatchObject([
      'maxLength',
    ]);
    name.setValue('ron');
    await wait();
    expect(name.errors).toBe(null);
  }
});

test('validate with provided ajv', async () => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false });

  ajv.addKeyword({
    keyword: 'isEven',
    async: true,
    validate: async (schema: boolean, data: number): Promise<boolean> => {
      return data % 2 === (schema ? 0 : 1);
    },
    errors: true,
  });
  const node = nodeFromJsonSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        num: {
          type: 'number',
          isEven: true,
          default: 1,
        },
      },
    },
    ajv,
  });
  const num = node?.findNode('num');
  await wait();
  if (num && num.type === 'number') {
    expect(num.errors?.[0]?.keyword).toBe('isEven');
    num.setValue(2);
    await wait();
    expect(num.errors).toBe(null);
  }
});

test('setState, getState', async () => {
  const node = nodeFromJsonSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
    },
  });
  const name = node?.findNode('name');
  if (name) {
    expect(name.state).toMatchObject({});
    name.setState((state) => ({ ...state, isTouched: true }));
    name.setState({ isDirty: true });
    expect(name.state).toMatchObject({ isTouched: true, isDirty: true });
    name.setState({ isDirty: undefined });
    expect(name.state).toMatchObject({ isTouched: true });
  }
});

test('setValue, applyValue', async () => {
  const node = nodeFromJsonSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        age: { type: 'number' },
      },
      oneOf: [
        { properties: { status: { enum: ['active'] } }, required: ['age'] },
      ],
    },
  });
  node.setValue({ status: 'active', age: 10 });
  await wait();
  expect(node.value).toMatchObject({ status: 'active', age: 10 });

  node.setValue((prev) => ({ ...prev, age: 20 }));
  await wait();
  expect(node.value).toMatchObject({ status: 'active', age: 20 });

  node.setValue({ status: 'inactive', age: 10 });
  await wait();
  expect(node.value).toMatchObject({ status: 'inactive' });

  // @ts-expect-error applyValue는 모든 노드에서 동일한 타입을 받기 때문에 타입 오류 발생
  node.applyValue({ status: 'inactive', age: 20 });
  await wait();
  expect(node.value).toMatchObject({ status: 'inactive', age: 20 });
});

test('child node error sending', async () => {
  const ajv = new Ajv({ allErrors: true, strictSchema: false });

  ajv.addKeyword({
    keyword: 'isEven',
    async: true,
    validate: (schema: boolean, data: number): boolean => {
      return !!(data % 2 === (schema ? 0 : 1));
    },
    errors: true,
  });

  const node = nodeFromJsonSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        index: {
          type: 'number',
          isEven: true,
          default: 1,
        },
        data: {
          type: 'array',
          items: {
            type: 'number',
            isEven: true,
          },
        },
        name: {
          type: 'string',
          maxLength: 5,
          default: 'Ron',
        },
      },
    },
    defaultValue: {
      data: [3, 5, 7],
    },
    ajv,
  });
  await wait();

  const index = node?.findNode('index');
  if (index && index.type === 'number') {
    expect(index.errors?.[0]?.keyword).toBe('isEven');
    index.setValue(2);
    await wait();
    expect(index.errors).toBe(null);
  }

  const data = node?.findNode('data');
  if (data && data.type === 'array') {
    data.children.forEach((child, index) => {
      expect(child.node.errors).toEqual([
        {
          dataPath: `.data.[${index}]`,
          instancePath: `/data/${index}`,
          key: undefined,
          keyword: 'isEven',
          message: 'must pass "isEven" keyword validation',
          params: {},
          schemaPath: '#/properties/data/items/isEven',
        },
      ]);
    });
    data.setValue([2, 4, 6]);
    await wait();
    data.children.forEach((child) => {
      expect(child.node.errors).toBe(null);
    });
  }

  const name = node?.findNode('name');
  if (name && name.type === 'string') {
    expect(name.errors).toBe(null);
    name.setValue('Ron Weasley');
    await wait();
    expect(name.errors).toEqual([
      {
        dataPath: '.name',
        instancePath: '/name',
        key: undefined,
        keyword: 'maxLength',
        message: 'must NOT have more than 5 characters',
        params: {
          limit: 5,
        },
        schemaPath: '#/properties/name/maxLength',
      },
    ]);
  }
});
