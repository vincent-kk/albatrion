import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import { BooleanNode } from '../nodes/BooleanNode';

describe('BooleanNode', () => {
  it('불리언 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
          },
        },
      },
    });

    const booleanNode = node?.findNode('isActive');
    expect(booleanNode).toBeDefined();
    expect(booleanNode?.type).toBe('boolean');
  });

  it('불리언 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
          },
        },
      },
    });

    const booleanNode = node?.findNode('isActive') as BooleanNode;
    expect(booleanNode.value).toBeUndefined();

    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.value).toBe(true);

    booleanNode.setValue(false);
    await delay();
    expect(booleanNode.value).toBe(false);
  });

  it('불리언 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
            default: true,
          },
        },
      },
    });

    const booleanNode = node?.findNode('isActive') as BooleanNode;
    await delay();
    expect(booleanNode.value).toBe(true);
  });

  it('불리언 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
          },
        },
      },
    });

    const booleanNode = node?.findNode('isActive') as BooleanNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    booleanNode.subscribe(mockListener);

    // 값 변경
    booleanNode.setValue(true);
    await delay();

    // 이벤트가 발생했는지 확인
    expect(mockListener).toHaveBeenCalledWith({
      type:
        NodeEventType.UpdateValue |
        NodeEventType.Refresh |
        NodeEventType.UpdateComputedProperties,
      payload: {
        [NodeEventType.UpdateValue]: true,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: undefined,
          current: true,
        },
      },
    });
  });

  it('불리언 노드의 값이 정상적으로 파싱되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
          },
        },
      },
    });

    const booleanNode = node?.findNode('isActive') as BooleanNode;

    // 문자열 'true'를 불리언으로 파싱
    // @ts-expect-error
    booleanNode.setValue('true');
    await delay();
    expect(booleanNode.value).toBe(true);

    // 문자열 'false'를 불리언으로 파싱
    // @ts-expect-error
    booleanNode.setValue('false');
    await delay();
    expect(booleanNode.value).toBe(false);

    // 숫자 1을 불리언으로 파싱
    // @ts-expect-error
    booleanNode.setValue(1);
    await delay();
    expect(booleanNode.value).toBe(true);

    // 숫자 0을 불리언으로 파싱
    // @ts-expect-error
    booleanNode.setValue(0);
    await delay();
    expect(booleanNode.value).toBe(false);
  });

  it('불리언 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          isActive: {
            type: 'boolean',
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    const booleanNode = node?.findNode('isActive') as BooleanNode;
    await delay();

    // 유효한 값 설정
    booleanNode.setValue(true);
    await delay();
    expect(booleanNode.errors).toEqual([]);

    // 유효한 값 설정
    booleanNode.setValue(false);
    await delay();
    expect(booleanNode.errors).toEqual([]);
  });
});
