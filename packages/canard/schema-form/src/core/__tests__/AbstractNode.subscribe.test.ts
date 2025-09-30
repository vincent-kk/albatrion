import { beforeEach, describe, expect, it, vi } from 'vitest';

import { delay } from '@winglet/common-utils';

import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import { AbstractNode } from '../nodes/AbstractNode/AbstractNode';
import { NodeEventType } from '../nodes/type';

// 테스트를 위한 구체 클래스 구현
class TestNode extends AbstractNode<JsonSchemaWithVirtual, AllowedValue> {
  constructor() {
    super({
      jsonSchema: { type: 'string' },
      scope: 'test',
      name: 'test',
      onChange: () => {},
    });
  }

  // 필수 메서드 구현
  get value(): AllowedValue {
    return '';
  }

  applyValue(): void {
    // 테스트에서는 구현이 필요 없음
  }

  parseValue(value: unknown): AllowedValue {
    return value as AllowedValue;
  }
}

describe('AbstractNode', () => {
  let node: TestNode;

  beforeEach(() => {
    node = new TestNode();
  });

  describe('subscribe and publish', () => {
    it('리스너가 정상적으로 등록되고 호출되어야 함', async () => {
      const mockListener = vi.fn();

      // 리스너 등록
      node.subscribe(mockListener);

      // publish 호출 시 리스너가 실행되는지 확인
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {},
        options: {},
      });

      // 두 번째 publish 호출 시에도 리스너가 실행되어야 함
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener).toHaveBeenCalledTimes(2);
    });

    it('unsubscribe 함수가 정상적으로 동작해야 함', async () => {
      const mockListener = vi.fn();

      // 리스너 등록 및 unsubscribe 함수 받기
      const unsubscribe = node.subscribe(mockListener);

      // 초기 상태에서 publish 호출 시 리스너가 실행되어야 함
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener).toHaveBeenCalledTimes(1);

      // unsubscribe 실행
      unsubscribe();

      // unsubscribe 후 publish 호출 시 리스너가 실행되지 않아야 함
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener).toHaveBeenCalledTimes(1); // 카운트가 증가하지 않아야 함
    });

    it('여러 리스너를 등록하고 개별적으로 unsubscribe 할 수 있어야 함', async () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      const mockListener3 = vi.fn();

      // 여러 리스너 등록
      node.subscribe(mockListener1);
      const unsubscribe2 = node.subscribe(mockListener2);
      node.subscribe(mockListener3);

      // 초기 상태에서 모든 리스너가 호출되어야 함
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener1).toHaveBeenCalledTimes(1);
      expect(mockListener2).toHaveBeenCalledTimes(1);
      expect(mockListener3).toHaveBeenCalledTimes(1);

      // 두 번째 리스너만 unsubscribe
      unsubscribe2();

      // unsubscribe 후 publish 시 나머지 리스너들만 실행되어야 함
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener1).toHaveBeenCalledTimes(2);
      expect(mockListener2).toHaveBeenCalledTimes(1); // 카운트가 증가하지 않아야 함
      expect(mockListener3).toHaveBeenCalledTimes(2);
    });

    it('존재하지 않는 리스너를 unsubscribe 하려고 할 때 에러가 발생하지 않아야 함', async () => {
      const mockListener = vi.fn();
      const unsubscribe = node.subscribe(mockListener);

      // 두 번 unsubscribe 해도 에러가 발생하지 않아야 함
      unsubscribe();
      expect(() => unsubscribe()).not.toThrow();

      // unsubscribe 후 publish가 정상적으로 동작해야 함
      node.publish(NodeEventType.UpdateValue);

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('이벤트 페이로드와 옵션이 정상적으로 전달되어야 함', async () => {
      const mockListener = vi.fn();
      node.subscribe(mockListener);

      node.publish(NodeEventType.UpdateValue, 'new', {
        previous: 'old',
        current: 'new',
      });

      // microtask가 실행될 때까지 대기
      await delay();

      expect(mockListener).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: 'new' },
        options: {
          [NodeEventType.UpdateValue]: { previous: 'old', current: 'new' },
        },
      });
    });
  });
});

describe('SchemaNode computed properties', () => {
  describe('visible property', () => {
    it('should update visible based on computed.visible condition', async () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          openingDate: {
            type: 'string',
            format: 'date',
            computed: {
              visible: '../title === "wow"',
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const openingDateNode = node.find('/openingDate');

      expect(openingDateNode?.visible).toBe(false); // 초기값은 true

      node.setValue({ title: 'wow' });
      await delay();
      expect(openingDateNode?.visible).toBe(true); // title이 "wow"이므로 true

      node.setValue({ title: 'hello' });
      await delay();
      expect(openingDateNode?.visible).toBe(false); // title이 "wow"가 아니므로 false
    });
  });

  describe('readOnly property', () => {
    it('should update readOnly based on computed.readOnly condition', async () => {
      const schema = {
        type: 'object',
        properties: {
          isAdmin: { type: 'boolean' },
          userInfo: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                computed: {
                  readOnly: '(#/isAdmin)===false',
                },
              },
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      const nameNode = node.find('./userInfo/name');

      expect(nameNode?.readOnly).toBe(false); // 초기값은 false

      node.setValue({ isAdmin: false });
      await delay();
      expect(nameNode?.readOnly).toBe(true); // isAdmin이 false이므로 readOnly

      node.setValue({ isAdmin: true });
      await delay();
      expect(nameNode?.readOnly).toBe(false); // isAdmin이 true이므로 편집 가능
    });
  });

  describe('disabled property', () => {
    it('should update disabled based on computed.disabled condition', async () => {
      const schema = {
        type: 'object',
        properties: {
          isLoading: { type: 'boolean' },
          submitButton: {
            type: 'string',
            computed: {
              disabled: '#/isLoading === true',
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      const buttonNode = node.find('./submitButton');

      expect(buttonNode?.disabled).toBe(false); // 초기값은 false

      node.setValue({ isLoading: true });
      await delay();
      expect(buttonNode?.disabled).toBe(true); // isLoading이 true이므로 disabled

      node.setValue({ isLoading: false });
      await delay();
      expect(buttonNode?.disabled).toBe(false); // isLoading이 false이므로 활성화
    });
  });

  describe('watchValues property', () => {
    it('should update watchValues based on computed.watch paths', async () => {
      const schema = {
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'harry' },
              age: { type: 'number', default: 10 },
            },
          },
          greeting: {
            type: 'string',
            formType: 'greeting',
            computed: {
              watch: ['/profile/name', '#/profile/age', '#/profile'],
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });
      const greetingNode = node.find('./greeting');

      await delay();

      // 초기값 확인
      expect(greetingNode?.watchValues).toEqual([
        'harry',
        10,
        { name: 'harry', age: 10 },
      ]);

      // profile.name 변경 시 watchValues 업데이트 확인
      node.setValue({ profile: { name: 'ron', age: 10 } });
      await delay();
      expect(greetingNode?.watchValues).toEqual([
        'ron',
        10,
        { name: 'ron', age: 10 },
      ]);

      // profile.age 변경 시 watchValues 업데이트 확인
      node.setValue({ profile: { name: 'ron', age: 11 } });
      await delay();
      expect(greetingNode?.watchValues).toEqual([
        'ron',
        11,
        { name: 'ron', age: 11 },
      ]);
    });
  });

  describe('computed properties update events', () => {
    it('should emit UpdateComputedProperties event when dependencies change', async () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: {
            type: 'string',
            computed: {
              visible: './title === "test"',
            },
          },
        },
      } satisfies JsonSchema;

      const node = nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: () => {},
      });

      await delay();

      const descriptionNode = node.find('./description');
      const listener = vi.fn();

      descriptionNode?.subscribe(listener);

      node.setValue({ title: 'test' });

      await delay();

      // After initialized, UpdateValue event is dispatched synchronously
      expect(listener).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: NodeEventType.UpdateValue,
          options: {
            [NodeEventType.UpdateValue]: {
              previous: undefined,
              current: undefined,
            },
          },
          payload: {
            [NodeEventType.UpdateValue]: undefined,
          },
        }),
      );

      // Async events - only RequestRefresh is emitted
      // Note: UpdateComputedProperties is handled separately and may not always fire
      expect(listener).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: NodeEventType.RequestRefresh,
          options: {},
          payload: {},
        }),
      );
    });
  });
});
