import Ajv from 'ajv';
import { describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';

import { NodeEventType, ValidationMode } from '../nodes';
import type { StringNode } from '../nodes/StringNode';
import { createValidatorFactory } from './utils/createValidatorFactory';

describe('StringNode nullable functionality', () => {
  it('문자열 노드가 nullable:true일 때 null 값을 허용해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
          },
        },
      },
    });

    const stringNode = node?.find('name') as StringNode;

    // null 값 설정
    stringNode.setValue(null);
    await delay();
    expect(stringNode.value).toBeNull();

    // 문자열 값 설정
    stringNode.setValue('test');
    await delay();
    expect(stringNode.value).toBe('test');

    // null로 다시 변경
    stringNode.setValue(null);
    await delay();
    expect(stringNode.value).toBeNull();
  });

  it('문자열 노드가 nullable:false일 때 null 값을 거부해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            // nullable이 명시적으로 false이거나 없을 때 null을 거부
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    const stringNode = node?.find('name') as StringNode;

    // null 값 설정 시도
    stringNode.setValue(null);
    await delay();

    // null 대신 빈 문자열로 변환됨
    expect(stringNode.value).toEqual('');
  });

  it('nullable 문자열 노드의 기본값이 null일 수 있어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            nullable: true,
            default: null,
          },
        },
      },
    });

    const stringNode = node?.find('description') as StringNode;
    await delay();
    expect(stringNode.value).toBeNull();
  });

  it('nullable 문자열 노드의 onChange 이벤트가 정상적으로 전파되어야 함', async () => {
    const mockOnChange = vi.fn();

    const node = nodeFromJsonSchema({
      onChange: mockOnChange,
      jsonSchema: {
        type: 'object',
        properties: {
          data: {
            type: 'string',
            nullable: true,
          },
        },
      },
    });

    const stringNode = node?.find('data') as StringNode;

    // null로 변경
    stringNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ data: null });

    // 문자열로 변경
    stringNode.setValue('test');
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ data: 'test' });

    // 다시 null로 변경
    stringNode.setValue(null);
    await delay();

    expect(mockOnChange).toHaveBeenCalledWith({ data: null });
  });

  it('nullable 문자열 노드가 유효성 검사와 함께 동작해야 함', async () => {
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
            nullable: true,
            format: 'email',
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const emailNode = node?.find('email') as StringNode;

    // null은 유효해야 함
    emailNode.setValue(null);
    await delay();
    expect(emailNode.errors).toEqual([]);

    // 유효한 이메일
    emailNode.setValue('test@example.com');
    await delay();
    expect(emailNode.errors).toEqual([]);

    // 다시 null로 설정하면 오류가 없어야 함
    emailNode.setValue(null);
    await delay();
    expect(emailNode.errors).toEqual([]);
  });

  it('nullable 문자열과 enum이 함께 있을 때 정상적으로 동작해야 함', async () => {
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
          status: {
            type: 'string',
            nullable: true,
            enum: ['active', 'inactive', 'pending', null],
          },
        },
      },
      validationMode: ValidationMode.OnChange,
      validatorFactory,
    });

    const statusNode = node?.find('status') as StringNode;

    // null 값 허용
    statusNode.setValue(null);
    await delay();
    expect(statusNode.errors).toEqual([]);
    expect(statusNode.value).toBeNull();

    // enum 값 허용
    statusNode.setValue('active');
    await delay();
    expect(statusNode.errors).toEqual([]);
    expect(statusNode.value).toBe('active');

    // enum에 없는 값 거부
    statusNode.setValue('unknown');
    await delay();
    expect(statusNode.errors.length).toBeGreaterThan(0);
  });

  it('nullable 문자열 노드의 이벤트가 정상적으로 발생해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          comment: {
            type: 'string',
            nullable: true,
          },
        },
      },
    });

    await delay();

    const stringNode = node?.find('comment') as StringNode;
    const mockListener = vi.fn();
    stringNode.subscribe(mockListener);

    // null 값으로 변경
    stringNode.setValue(null);
    await delay();

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
    expect(mockListener).toHaveBeenNthCalledWith(2, {
      type: NodeEventType.RequestRefresh,
      payload: {},
      options: {},
    });
  });

  it('nullable이 명시되지 않은 경우 null을 빈 문자열로 변환해야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          strictField: {
            type: 'string',
            // nullable이 명시되지 않음
          },
        },
      },
      validationMode: ValidationMode.OnChange,
    });

    const stringNode = node?.find('strictField') as StringNode;

    // null 설정 시도
    stringNode.setValue(null);
    await delay();

    // null이 빈 문자열로 변환됨
    expect(stringNode.value).toEqual('');
  });

  it('nullable 문자열 노드의 dirty 및 touched 상태가 정상적으로 관리되어야 함', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          comment: {
            type: 'string',
            nullable: true,
            default: 'default comment',
          },
        },
      },
    });

    const commentNode = node?.find('comment') as StringNode;
    await delay();

    // 초기 상태 확인 (속성이 있는 경우에만)
    if ('isDirty' in commentNode) {
      expect(commentNode.isDirty).toBe(false);
    }
    if ('isTouched' in commentNode) {
      expect(commentNode.isTouched).toBe(false);
    }

    // null로 변경
    commentNode.setValue(null);
    await delay();

    if ('isDirty' in commentNode) {
      expect(commentNode.isDirty).toBe(true);
    }
    if ('isTouched' in commentNode) {
      expect(commentNode.isTouched).toBe(true);
    }

    // 기본값으로 복원
    commentNode.setValue('default comment');
    await delay();

    if ('isDirty' in commentNode) {
      expect(commentNode.isDirty).toBe(false);
    }
    if ('isTouched' in commentNode) {
      expect(commentNode.isTouched).toBe(true);
    }
  });
});
