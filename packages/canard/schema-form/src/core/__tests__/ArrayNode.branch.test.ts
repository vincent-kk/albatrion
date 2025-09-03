import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { ArrayNode } from '../nodes/ArrayNode';

describe('ArrayNode-Terminal', () => {
  it('불리언 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: {
              type: 'boolean',
            },
          },
        },
      },
    });

    const booleanNode = node?.find('arr');
    expect(booleanNode).toBeDefined();
    expect(booleanNode?.value).toEqual([]);
    expect(booleanNode?.type).toBe('array');
  });

  it('불리언 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
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
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
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
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
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

    await delay();

    // 초기화 이벤트가 발생했는지 확인 (호출 횟수와 이벤트 타입만 검증)
    expect(mockListener).toHaveBeenCalledTimes(1);
    const firstCall = mockListener.mock.calls[0][0];
    expect(firstCall.type & NodeEventType.Initialized).toBeTruthy();
    expect(firstCall.type & NodeEventType.UpdateValue).toBeTruthy();
    expect(firstCall.payload[NodeEventType.UpdateValue]).toEqual([]);

    mockListener.mockClear();

    // 값 변경
    booleanNode.setValue([true, false, true]);
    await delay();

    // 값 변경 이벤트가 발생했는지 확인 (호출 횟수와 핵심 이벤트 타입만 검증)
    expect(mockListener).toHaveBeenCalledTimes(1);
    const secondCall = mockListener.mock.calls[0][0];
    expect(secondCall.type & NodeEventType.UpdateValue).toBeTruthy();
    expect(secondCall.payload[NodeEventType.UpdateValue]).toEqual([
      true,
      false,
      true,
    ]);
    expect(secondCall.options[NodeEventType.UpdateValue]).toMatchObject({
      previous: [],
      current: [true, false, true],
    });
  });

  it('불리언 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
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

  it('터미널 배열에서 잘못된 인덱스로 remove 호출 시 값을 변경하지 않고 undefined를 반환해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: { type: 'boolean' },
          },
        },
      },
    });

    const booleanNode = node?.find('arr') as ArrayNode;
    booleanNode.setValue([true, false]);
    await delay();

    const invalidIndices = [-1, 2, 100];
    for (const idx of invalidIndices) {
      const removed = await booleanNode.remove(idx);
      await delay();
      expect(removed).toBeUndefined();
      expect(booleanNode.value).toEqual([true, false]);
    }
  });

  it('터미널 배열에서 잘못된 인덱스로 update 호출 시 값을 변경하지 않고 undefined를 반환해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          arr: {
            type: 'array',
            items: { type: 'boolean' },
          },
        },
      },
    });

    const booleanNode = node?.find('arr') as ArrayNode;
    booleanNode.setValue([true, false]);
    await delay();

    const invalidIndices = [-1, 2, 100];
    for (const idx of invalidIndices) {
      const updated = await booleanNode.update(idx, true);
      await delay();
      expect(updated).toBeUndefined();
      expect(booleanNode.value).toEqual([true, false]);
    }
  });
});
