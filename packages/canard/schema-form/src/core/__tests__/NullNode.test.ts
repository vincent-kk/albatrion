import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { NullNode } from '../nodes/NullNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('NullNode', () => {
  it('널 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          emptyValue: {
            type: 'null',
            nullable: true,
          },
        },
      },
    });

    const nullNode = node?.find('emptyValue');
    expect(nullNode).toBeDefined();
    expect(nullNode?.type).toBe('null');
  });

  it('널 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          emptyValue: {
            type: 'null',
            nullable: true,
          },
        },
      },
    });

    const nullNode = node?.find('emptyValue') as NullNode;
    expect(nullNode.value).toBeUndefined();

    nullNode.setValue(null);
    await delay();
    expect(nullNode.value).toBeNull();
  });

  it('널 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          emptyValue: {
            type: 'null',
            default: null,
            nullable: true,
          },
        },
      },
    });

    const nullNode = node?.find('emptyValue') as NullNode;
    await delay();
    expect(nullNode.value).toBeNull();
  });

  it('널 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          emptyValue: {
            type: 'null',
            nullable: true,
          },
        },
      },
    });

    await delay();

    const nullNode = node?.find('emptyValue') as NullNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    nullNode.subscribe(mockListener);

    // 값 변경
    nullNode.setValue(null);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // After initialized, UpdateValue event is dispatched synchronously
    expect(mockListener).toHaveBeenNthCalledWith(1, {
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: null,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: undefined,
          current: null,
        },
      },
    });

    // Async events are merged in the next microtask
    // Note: UpdateComputedProperties is not emitted when there are no computed properties
    expect(mockListener).toHaveBeenNthCalledWith(2, {
      type: NodeEventType.RequestRefresh,
      payload: {},
      options: {},
    });
  });

  it('널 노드의 값이 정상적으로 파싱되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          emptyValue: {
            type: 'null',
            nullable: true,
          },
        },
      },
    });

    const nullNode = node?.find('emptyValue') as NullNode;

    // null 값을 파싱
    nullNode.setValue(null);
    await delay();
    expect(nullNode.value).toBeNull();

    // undefined 값을 파싱
    nullNode.setValue(undefined);
    await delay();
    expect(nullNode.value).toBeUndefined();
  });

  it('널 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
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
          emptyValue: {
            type: 'null',
            nullable: true,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const nullNode = node?.find('emptyValue') as NullNode;
    await delay();

    // 유효한 값 설정
    nullNode.setValue(null);
    await delay();
    expect(nullNode.errors).toEqual([]);

    // 유효하지 않은 값 설정
    // @ts-expect-error
    nullNode.setValue('not null');
    await delay();
    expect(nullNode.errors.length).toBeGreaterThan(0);
    expect(nullNode.errors[0].keyword).toBe('type');
  });
});
