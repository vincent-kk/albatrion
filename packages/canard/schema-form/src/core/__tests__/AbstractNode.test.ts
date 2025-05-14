import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { StringNode } from '../nodes/StringNode';
import { NodeEvent, NodeEventType, ValidationMode } from '../nodes/type';

const wait = (delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode', () => {
  it('node.find', () => {
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
      validationMode: ValidationMode.OnChange,
    });

    const founder = node?.find('house.founder');
    const founderName = founder?.find('name');
    expect(founder?.value).toEqual({
      name: 'Godric Gryffindor',
      yearOfBirth: 900,
    });
    expect(node?.find('house.founder.name')).toBe(founderName);
    // find a relative node
    const founderBirthOfYear1 = founderName?.find('_.yearOfBirth');
    expect(founderBirthOfYear1?.value).toBe(900);
    // find a absolute node
    const founderBirthOfYear2 = founderName?.find(
      '$.house.founder.yearOfBirth',
    );
    expect(founderBirthOfYear2?.value).toBe(900);
  });

  it('validate', async () => {
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
      validationMode: ValidationMode.OnChange,
    });
    await wait();

    const name = node?.find('name');
    expect(name?.errors.map(({ keyword }) => keyword)).toEqual([
      'maxLength',
      'pattern',
    ]);
    if (name && name.type === 'string') {
      name.setValue('ron weasley');
      await wait();
      expect(name.errors.map(({ keyword }) => keyword)).toEqual(['maxLength']);
      name.setValue('ron');
      await wait();
      expect(name.errors).toEqual([]);
    }
  });

  it('validate with provided ajv', async () => {
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
      validationMode: ValidationMode.OnChange,
      ajv,
    });
    const num = node?.find('num');
    await wait();
    if (num && num.type === 'number') {
      expect(num.errors?.[0]?.keyword).toBe('isEven');
      num.setValue(2);
      await wait();
      expect(num.errors).toEqual([]);
    }
  });

  it('setState, getState', async () => {
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
    const name = node?.find('name');
    if (name) {
      expect(name.state).toEqual({});
      name.setState((state) => ({ ...state, isTouched: true }));
      name.setState({ isDirty: true });
      expect(name.state).toEqual({ isTouched: true, isDirty: true });
      name.setState({ isDirty: undefined });
      expect(name.state).toEqual({ isTouched: true });
    }
  });

  it('setValue, applyValue', async () => {
    const onChange = vi.fn();
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'inactive'] },
          age: { type: 'number' },
        },
        if: {
          properties: {
            status: { enum: ['active'] },
          },
        },
        then: {
          required: ['age'],
        },
      },
      onChange,
    });
    await wait();
    node.setValue({ status: 'active', age: 10 });
    await wait();
    expect(onChange).toHaveBeenCalledWith({ status: 'active', age: 10 });

    node.setValue((prev) => ({ ...prev, age: 20 }));
    await wait();
    expect(onChange).toHaveBeenCalledWith({ status: 'active', age: 20 });

    node.setValue({ status: 'inactive', age: 10 });
    await wait();
    expect(onChange).toHaveBeenCalledWith({ status: 'inactive' });

    // @ts-expect-error applyValue는 모든 노드에서 동일한 타입을 받기 때문에 타입 오류 발생
    node.applyValue({ status: 'inactive', age: 20 });
    await wait();
    expect(onChange).toHaveBeenCalledWith({ status: 'inactive' });
  });

  it('child node error sending', async () => {
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
      validationMode: ValidationMode.OnChange,
      ajv,
    });
    await wait();

    const index = node?.find('index');
    if (index && index.type === 'number') {
      expect(index.errors?.[0]?.keyword).toBe('isEven');
      index.setValue(2);
      await wait();
      expect(index.errors).toEqual([]);
    }

    const data = node?.find('data');
    if (data && data.type === 'array') {
      data.children.forEach((child, index) => {
        expect(child.node.errors).toEqual([
          {
            dataPath: `.data[${index}]`,
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
        expect(child.node.errors).toEqual([]);
      });
    }

    const name = node?.find('name');
    if (name && name.type === 'string') {
      expect(name.errors).toEqual([]);
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
  it('event queue for node', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            format: 'date',
          },
          endDate: {
            type: 'string',
            format: 'date',
          },
        },
        virtual: {
          period: {
            fields: ['startDate', 'endDate'],
          },
        },
      },
    });
    let externalEvent: NodeEvent | undefined;
    node.subscribe((event) => {
      externalEvent = event;
    });

    await wait();

    // 최초로 node tree를 만들때 발생하는 이벤트
    expect(externalEvent).toEqual({
      type:
        NodeEventType.Activated |
        NodeEventType.UpdateValue |
        NodeEventType.UpdateChildren |
        NodeEventType.UpdateComputedProperties,
      payload: {},
      options: {
        [NodeEventType.UpdateValue]: {
          current: undefined,
          previous: undefined,
        },
      },
    });

    node?.find('period')?.subscribe((event) => {
      externalEvent = event;
    });

    await wait();

    const endDate = node?.find('endDate');

    (endDate as StringNode)?.setValue('2021-01-02');

    await wait();

    expect(externalEvent).toEqual({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: [undefined, '2021-01-02'],
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: [undefined, '2021-01-02'],
          previous: [undefined, undefined],
        },
      },
    });

    expect(node.value).toEqual({
      endDate: '2021-01-02',
    });
  });
});
