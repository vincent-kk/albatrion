import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';

describe('ArrayNode-Terminal', () => {
  it('불리언 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            terminal: true,
            items: {
              type: 'boolean',
            },
          },
        },
      },
    });

    const booleanNode = node?.find('arr');
    expect(booleanNode).toBeDefined();
    expect(booleanNode?.type).toBe('array');
  });

  it('불리언 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            terminal: true,
            items: {
              type: 'boolean',
            },
          },
        },
      },
    });

    await delay();

    const booleanNode = node?.find('arr') as ArrayNode;
    expect(booleanNode.value).toEqual([]);

    booleanNode.setValue([true, false, true]);
    await delay();

    expect(booleanNode.value).toEqual([true, false, true]);

    booleanNode.setValue([false, false, false]);
    await delay();

    expect(booleanNode.value).toEqual([false, false, false]);
  });

  it('불리언 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            terminal: true,
            items: {
              type: 'boolean',
            },
            default: [true, false, true],
          },
        },
      },
    });

    await delay();

    const booleanNode = node?.find('arr') as ArrayNode;
    expect(booleanNode.value).toEqual([true, false, true]);
  });

  it('불리언 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            terminal: true,
            items: {
              type: 'boolean',
            },
          },
        },
      },
    });

    const booleanNode = node?.find('arr') as ArrayNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    booleanNode.subscribe(mockListener);

    // 값 변경
    booleanNode.setValue([true, false, true]);
    await delay();

    // 이벤트가 발생했는지 확인
    expect(mockListener).toHaveBeenCalledWith({
      type:
        NodeEventType.Activated |
        NodeEventType.Refresh |
        NodeEventType.UpdateValue |
        NodeEventType.UpdateComputedProperties,
      payload: {
        [NodeEventType.UpdateValue]: [true, false, true],
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: [],
          current: [true, false, true],
        },
      },
    });
  });

  it('불리언 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            terminal: true,
            items: {
              type: 'boolean',
            },
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    await delay();

    const booleanNode = node?.find('arr') as ArrayNode;

    // 유효한 값 설정
    booleanNode.setValue([true, false, true]);
    await delay();

    expect(booleanNode.errors).toEqual([]);

    // 유효한 값 설정
    booleanNode.setValue([false, false, false]);
    await delay();

    expect(booleanNode.errors).toEqual([]);
  });
});
