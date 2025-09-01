import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { StringNode } from '../nodes/StringNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('StringNode', () => {
  it('문자열 노드가 정상적으로 생성되어야 함', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    });

    const stringNode = node?.find('name');
    expect(stringNode).toBeDefined();
    expect(stringNode?.type).toBe('string');
  });

  it('문자열 노드의 값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    });

    const stringNode = node?.find('name') as StringNode;
    expect(stringNode.value).toBeUndefined();

    stringNode.setValue('Lee');
    await delay();
    expect(stringNode.value).toBe('Lee');
  });

  it('문자열 노드의 기본값이 정상적으로 설정되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            default: 'John',
          },
        },
      },
    });

    const stringNode = node?.find('name') as StringNode;
    await delay();
    expect(stringNode.value).toBe('John');
  });

  it('문자열 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    });

    const stringNode = node?.find('name') as StringNode;

    // 이벤트 리스너 등록
    const mockListener = vi.fn();
    stringNode.subscribe(mockListener);

    // 값 변경
    stringNode.setValue('Ron');
    await delay();

    // 이벤트가 발생했는지 확인
    expect(mockListener).toHaveBeenCalledWith({
      type:
        NodeEventType.Activated |
        NodeEventType.RequestRefresh |
        NodeEventType.UpdateValue |
        NodeEventType.UpdateComputedProperties,
      payload: {
        [NodeEventType.UpdateValue]: 'Ron',
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous: undefined,
          current: 'Ron',
        },
      },
    });
  });

  it('문자열 노드의 값이 정상적으로 파싱되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    });

    const stringNode = node?.find('name') as StringNode;

    // 숫자를 문자열로 파싱
    // @ts-expect-error
    stringNode.setValue(123);
    await delay();
    expect(stringNode.value).toBe('123');

    // 불리언을 문자열로 파싱
    // @ts-expect-error
    stringNode.setValue(true);
    await delay();
    expect(stringNode.value).toBe('');

    // null을 문자열로 파싱
    stringNode.setValue(null);
    await delay();
    expect(stringNode.value).toBe('');
  });

  it('문자열 노드의 유효성 검사가 정상적으로 동작해야 함', async () => {
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
          email: {
            type: 'string',
            format: 'email',
            minLength: 5,
            maxLength: 50,
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const stringNode = node?.find('email') as StringNode;
    await delay();

    // 유효한 값 설정
    stringNode.setValue('test@example.com');
    await delay();
    expect(stringNode.errors).toEqual([]);

    // 최소 길이 이하 설정
    stringNode.setValue('a@b');
    await delay();
    expect(stringNode.errors.length).toBeGreaterThan(0);
    expect(stringNode.errors[0].keyword).toBe('minLength');

    // 최대 길이 초과 설정
    stringNode.setValue('a'.repeat(51) + '@example.com');
    await delay();
    expect(stringNode.errors.length).toBeGreaterThan(0);
    expect(stringNode.errors[0].keyword).toBe('maxLength');
  });

  it('문자열 노드의 패턴 검사가 정상적으로 동작해야 함', async () => {
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
          phoneNumber: {
            type: 'string',
            pattern: '^\\d{3}-\\d{3,4}-\\d{4}$',
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const stringNode = node?.find('phoneNumber') as StringNode;
    await delay();

    // 유효한 값 설정
    stringNode.setValue('010-1234-5678');
    await delay();
    expect(stringNode.errors).toEqual([]);

    // 유효하지 않은 값 설정
    stringNode.setValue('01012345678');
    await delay();
    expect(stringNode.errors.length).toBeGreaterThan(0);
    expect(stringNode.errors[0].keyword).toBe('pattern');
  });
});
