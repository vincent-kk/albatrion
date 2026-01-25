import Ajv from 'ajv/dist/2020';
import { describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { StringNode } from '../nodes/StringNode';
import {
  type NodeEventCollection,
  NodeEventType,
  NodeState,
  SetValueOption,
  ValidationMode,
} from '../nodes/type';
import { createValidatorFactory } from './utils/createValidatorFactory';

const wait = (delay = 5) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode', () => {
  it('node.find', async () => {
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
              terminal: {
                type: 'object',
                terminal: true,
                default: { name: 'Hogwarts' },
              },
            },
          },
        },
      },
      onChange: () => {},
      validationMode: ValidationMode.OnChange,
    });

    await wait();

    const founder = node?.find('/house/founder');
    const founderName = founder?.find('name');
    expect(founder?.value).toEqual({
      name: 'Godric Gryffindor',
      yearOfBirth: 900,
    });
    expect(node?.find('#/house/founder/name')).toBe(founderName);
    // find a relative node
    const founderBirthOfYear1 = founderName?.find('../yearOfBirth');
    expect(founderBirthOfYear1?.value).toBe(900);
    // find a absolute node
    const founderBirthOfYear2 = founderName?.find(
      '#/house/founder/yearOfBirth',
    );
    expect(founderBirthOfYear2?.value).toBe(900);

    const terminal = node?.find('/house/terminal/name');
    expect(terminal?.value).toEqual({ name: 'Hogwarts' });
  });

  it('validate', async () => {
    const validatorFactory = createValidatorFactory(
      new Ajv({
        allErrors: true,
        strictSchema: false,
        validateFormats: false,
      }),
    );
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
      onChange: () => {},
      validationMode: ValidationMode.OnChange,
      validatorFactory,
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

    const validatorFactory = createValidatorFactory(ajv);
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
      onChange: () => {},
      validationMode: ValidationMode.OnChange,
      validatorFactory,
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
      onChange: () => {},
    });
    const name = node?.find('name');
    if (name) {
      expect(name.state).toEqual({});
      name.setState((state) => ({ ...state, isTouched: true }));
      name.setState({ isDirty: true });
      expect(name.state).toEqual({ isTouched: true, isDirty: true });
      name.setState({ isDirty: undefined });
      expect(name.state).toEqual({ isTouched: true });
      name.setState(undefined);
      expect(name.state).toEqual({});
    }
  });

  describe('setState - 이벤트 발생', () => {
    it('setState 호출 시 UpdateState 이벤트가 발생해야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');
      const listener = vi.fn();
      name?.subscribe(listener);

      name?.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(listener).toHaveBeenCalled();
      const call = listener.mock.calls[0][0];
      expect(call.type & NodeEventType.UpdateState).toBeTruthy();
      expect(call.payload[NodeEventType.UpdateState]).toEqual({
        [NodeState.Dirty]: true,
      });
    });

    it('동일한 값 설정 시 이벤트가 발생하지 않아야 함 (idle 최적화)', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');
      name?.setState({ [NodeState.Dirty]: true });
      await wait();

      const listener = vi.fn();
      name?.subscribe(listener);

      // 동일한 값으로 다시 설정
      name?.setState({ [NodeState.Dirty]: true });
      await wait();

      // UpdateState 이벤트가 발생하지 않아야 함
      const updateStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateState,
      );
      expect(updateStateEvents).toHaveLength(0);
    });

    it('NodeState enum을 사용하여 상태를 설정할 수 있어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');

      // NodeState enum 사용
      name?.setState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        [NodeState.ShowError]: true,
      });

      expect(name?.state[NodeState.Dirty]).toBe(true);
      expect(name?.state[NodeState.Touched]).toBe(true);
      expect(name?.state[NodeState.ShowError]).toBe(true);
    });

    it('여러 키를 동시에 업데이트할 수 있어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');
      const listener = vi.fn();
      name?.subscribe(listener);

      // 한 번의 setState로 여러 키 업데이트
      name?.setState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        customFlag: 'test',
      });
      await wait();

      expect(name?.state).toEqual({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        customFlag: 'test',
      });

      // 이벤트는 한 번만 발생해야 함
      const updateStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateState,
      );
      expect(updateStateEvents).toHaveLength(1);
    });

    it('빈 객체를 전달해도 변경이 없으면 이벤트가 발생하지 않아야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');
      const listener = vi.fn();
      name?.subscribe(listener);

      name?.setState({});
      await wait();

      const updateStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateState,
      );
      expect(updateStateEvents).toHaveLength(0);
    });

    it('실제 변경이 있을 때만 이벤트가 발생하고, 새로운 객체 참조를 가져야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');
      const listener = vi.fn();
      name?.subscribe(listener);

      // 초기 state 참조 저장
      const initialState = name?.state;
      expect(initialState).toEqual({});

      // 첫 번째 변경: 이벤트 발생 + 새 참조
      name?.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(name?.state).not.toBe(initialState); // 새 참조
      expect(name?.state).toEqual({ [NodeState.Dirty]: true });

      const stateAfterFirst = name?.state;

      // 동일한 값 설정: 이벤트 미발생 + 참조 유지
      listener.mockClear();
      name?.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(listener).not.toHaveBeenCalled();
      expect(name?.state).toBe(stateAfterFirst); // 참조 동일

      // 다른 값 추가: 이벤트 발생 + 새 참조
      listener.mockClear();
      name?.setState({ [NodeState.Touched]: true });
      await wait();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(name?.state).not.toBe(stateAfterFirst); // 새 참조
      expect(name?.state).toEqual({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
    });

    it('undefined로 키를 삭제할 때 실제 삭제가 있어야만 이벤트가 발생해야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const name = node?.find('name');

      // 상태 설정
      name?.setState({ [NodeState.Dirty]: true, customKey: 'value' });
      await wait();

      const stateBeforeDelete = name?.state;
      const listener = vi.fn();
      name?.subscribe(listener);

      // 존재하지 않는 키 삭제 시도: 이벤트 미발생 + 참조 유지
      name?.setState({ nonExistentKey: undefined });
      await wait();

      expect(listener).not.toHaveBeenCalled();
      expect(name?.state).toBe(stateBeforeDelete);

      // 존재하는 키 삭제: 이벤트 발생 + 새 참조
      listener.mockClear();
      name?.setState({ customKey: undefined });
      await wait();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(name?.state).not.toBe(stateBeforeDelete);
      expect(name?.state).toEqual({ [NodeState.Dirty]: true });
      expect('customKey' in (name?.state ?? {})).toBe(false);
    });
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

    const validatorFactory = createValidatorFactory(ajv);
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
      onChange: () => {},
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });
    await wait();

    const index = node?.find('/index');
    if (index && index.type === 'number') {
      expect(index.errors?.[0]?.keyword).toBe('isEven');
      index.setValue(2);
      await wait();
      expect(index.errors).toEqual([]);
    }

    const data = node?.find('/data');
    if (data && data.type === 'array') {
      data.children?.forEach((child, index) => {
        expect(child.node.errors).toEqual([
          {
            dataPath: `/data/${index}`,
            keyword: 'isEven',
            message: 'must pass "isEven" keyword validation',
            details: {},
            source: expect.any(Object),
            key: undefined,
          },
        ]);
      });
      data.setValue([2, 4, 6]);
      await wait();
      data.children?.forEach((child) => {
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
          dataPath: '/name',
          keyword: 'maxLength',
          message: 'must NOT have more than 5 characters',
          details: {
            limit: 5,
          },
          source: expect.any(Object),
          key: undefined,
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
      onChange: () => {},
    });
    let externalEvent: NodeEventCollection[] = [];
    node.subscribe((event) => {
      externalEvent.push(event);
    });

    await wait();

    // 최초로 node tree를 만들때 발생하는 이벤트
    expect(externalEvent[0]).toEqual({
      type:
        NodeEventType.Initialized |
        NodeEventType.UpdateChildren |
        NodeEventType.UpdateComputedProperties,
      payload: {},
      options: {},
    });

    externalEvent = [];

    node?.find('period')?.subscribe((event) => {
      externalEvent.push(event);
    });

    const endDate = node?.find('endDate');

    (endDate as StringNode)?.setValue('2021-01-02');

    await wait();

    // After initialized, UpdateValue is dispatched synchronously first
    // VirtualNode uses array format for payload and previous
    expect(externalEvent[0]).toEqual({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: [undefined, '2021-01-02'],
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: [undefined, '2021-01-02'],
          previous: [undefined, undefined],
          inject: true,
        },
      },
    });

    // Parent ObjectNode UpdateValue follows synchronously
    expect(externalEvent[1]).toEqual({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          endDate: '2021-01-02',
        },
      },
      options: {
        [NodeEventType.UpdateValue]: {
          current: {
            endDate: '2021-01-02',
          },
          previous: {},
          settled: true,
          inject: true,
        },
      },
    });

    // RequestEmitChange follows in async event stream
    expect(externalEvent[2]).toEqual({
      type: NodeEventType.RequestEmitChange,
      payload: {
        [NodeEventType.RequestEmitChange]: SetValueOption.Default,
      },
      options: {},
    });

    expect(node.value).toEqual({
      endDate: '2021-01-02',
    });
  });
});
