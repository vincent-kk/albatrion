import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { NumberNode } from '../nodes/NumberNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('NumberNode', () => {
  it('숫자 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
          },
        },
      },
    });

    const numberNode = node?.find('age');
    expect(numberNode).toBeDefined();
    expect(numberNode?.type).toBe('number');
  });

  it('숫자 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
          },
        },
      },
    });

    const numberNode = node?.find('age') as NumberNode;
    expect(numberNode.value).toBeUndefined();

    numberNode.setValue(25);
    await delay();
    expect(numberNode.value).toBe(25);
  });

  it('숫자 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
            default: 30,
          },
        },
      },
    });

    const numberNode = node?.find('age') as NumberNode;
    await delay();
    expect(numberNode.value).toBe(30);
  });

  it('숫자 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
          },
        },
      },
    });

    await delay();

    const numberNode = node?.find('age') as NumberNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    numberNode.subscribe(mockListener);

    // 값 변경
    numberNode.setValue(35);
    await delay();

    // After initialized, UpdateValue event is dispatched synchronously
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: 35,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: undefined,
          current: 35,
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

  it('숫자 노드의 값이 정상적으로 파싱되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
          },
        },
      },
    });

    const numberNode = node?.find('age') as NumberNode;

    // 문자열 숫자를 숫자로 파싱
    // @ts-expect-error
    numberNode.setValue('40');
    await delay();
    expect(numberNode.value).toBe(40);

    // 숫자 문자열을 숫자로 파싱
    // @ts-expect-error
    numberNode.setValue('50.5');
    await delay();
    expect(numberNode.value).toBe(50.5);

    // 정수 노드의 경우 소수점이 제거되어야 함
    const integerNode = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          count: {
            type: 'integer',
          },
        },
      },
    }).find('count') as NumberNode;

    // @ts-expect-error
    integerNode.setValue('60.7');
    await delay();
    expect(integerNode.value).toBe(60);
  });

  it('숫자 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
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
          score: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const numberNode = node?.find('score') as NumberNode;
    await delay();

    // 유효한 값 설정
    numberNode.setValue(50);
    await delay();
    expect(numberNode.errors).toEqual([]);

    // 최소값 이하 설정
    numberNode.setValue(-10);
    await delay();
    expect(numberNode.errors.length).toBeGreaterThan(0);
    expect(numberNode.errors[0].keyword).toBe('minimum');

    // 최대값 초과 설정
    numberNode.setValue(150);
    await delay();
    expect(numberNode.errors.length).toBeGreaterThan(0);
    expect(numberNode.errors[0].keyword).toBe('maximum');
  });
});
