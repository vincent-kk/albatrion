import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType } from '../nodes';
import { StringNode } from '../nodes/StringNode';
import { VirtualNode } from '../nodes/VirtualNode';

describe('VirtualNode', () => {
  it('가상 노드가 정상적으로 생성되어야 함', async () => {
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

    // 가상 노드가 생성되었는지 확인
    const virtualNode = node?.find('period');
    expect(virtualNode).toBeDefined();
    expect(virtualNode?.type).toBe('virtual');

    // 참조 노드가 정상적으로 연결되었는지 확인
    const startDateNode = node?.find('startDate');
    const endDateNode = node?.find('endDate');
    expect(startDateNode).toBeDefined();
    expect(endDateNode).toBeDefined();
  });

  it('가상 노드의 값이 참조 노드의 값에 따라 변경되어야 함', async () => {
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

    const virtualNode = node?.find('period');
    const startDateNode = node?.find('startDate') as StringNode;
    const endDateNode = node?.find('endDate') as StringNode;

    // 초기값 확인
    expect(virtualNode?.value).toEqual([undefined, undefined]);

    // startDate 값 변경
    startDateNode?.setValue('2021-01-01');
    await delay();
    expect(virtualNode?.value).toEqual(['2021-01-01', undefined]);

    // endDate 값 변경
    endDateNode?.setValue('2021-01-02');
    await delay();
    expect(virtualNode?.value).toEqual(['2021-01-01', '2021-01-02']);
  });

  it('가상 노드의 값 변경 시 참조 노드의 값이 변경되어야 함', async () => {
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

    const virtualNode = node?.find('period') as VirtualNode;
    const startDateNode = node?.find('startDate') as StringNode;
    const endDateNode = node?.find('endDate') as StringNode;

    // 가상 노드의 값 변경
    virtualNode?.setValue(['2021-02-01', '2021-02-02']);
    await delay();

    // 참조 노드의 값이 변경되었는지 확인
    expect(startDateNode?.value).toBe('2021-02-01');
    expect(endDateNode?.value).toBe('2021-02-02');
  });

  it('가상 노드의 이벤트가 정상적으로 발생해야 함', async () => {
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

    const virtualNode = node?.find('period');
    const startDateNode = node?.find('startDate') as StringNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    virtualNode?.subscribe(mockListener);

    // 참조 노드의 값 변경
    startDateNode?.setValue('2021-03-01');
    await delay();

    // 이벤트가 발생했는지 확인
    expect(mockListener).toHaveBeenCalledWith({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: ['2021-03-01', undefined],
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: [undefined, undefined],
          current: ['2021-03-01', undefined],
        },
      },
    });
  });

  it('가상 노드의 기본값이 정상적으로 설정되어야 함', async () => {
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
      defaultValue: {
        startDate: '2021-04-01',
        endDate: '2021-04-02',
      },
    });

    const virtualNode = node?.find('period');
    await delay();

    // 가상 노드의 기본값이 정상적으로 설정되었는지 확인
    expect(virtualNode?.value).toEqual(['2021-04-01', '2021-04-02']);
  });

  it('가상 노드의 자식 노드가 정상적으로 생성되어야 함', async () => {
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

    const virtualNode = node?.find('period');
    await delay();

    // 가상 노드의 자식 노드가 정상적으로 생성되었는지 확인
    expect(virtualNode?.children?.length).toBe(2);
    expect(virtualNode?.children?.[0].node.type).toBe('string');
    expect(virtualNode?.children?.[1].node.type).toBe('string');
  });
});
