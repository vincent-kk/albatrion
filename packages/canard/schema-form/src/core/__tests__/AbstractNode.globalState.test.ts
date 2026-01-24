import { describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';

import type { AbstractNode } from '../nodes/AbstractNode';
import { NodeEventType, NodeState, type SchemaNode } from '../nodes/type';

/**
 * Test helper to access private __setGlobalState__ method
 * @internal This is only for testing purposes
 */
const setGlobalState = (
  node: SchemaNode | null | undefined,
  state?: Record<string, unknown>,
) => {
  // @ts-expect-error [test] access private method for testing
  (node as AbstractNode)?.__setGlobalState__(state);
};

const wait = (delay = 5) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode - globalState', () => {
  describe('globalState getter', () => {
    it('root 노드에서 globalState에 접근할 수 있어야 함', async () => {
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

      expect(node.globalState).toBeDefined();
      expect(node.globalState).toEqual({});
    });

    it('자식 노드에서 globalState는 rootNode의 globalState를 반환해야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            nested: {
              type: 'object',
              properties: {
                value: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node?.find('name');
      const nestedNode = node?.find('nested');
      const deepNode = node?.find('/nested/value');

      // 모든 노드에서 동일한 globalState를 참조해야 함
      expect(nameNode?.globalState).toBe(node.globalState);
      expect(nestedNode?.globalState).toBe(node.globalState);
      expect(deepNode?.globalState).toBe(node.globalState);
    });

    it('초기 globalState는 빈 객체여야 함', async () => {
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

      expect(node.globalState).toEqual({});
    });
  });

  describe('setGlobalState', () => {
    it('root 노드에서 globalState를 업데이트할 수 있어야 함', async () => {
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

      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      expect(node.globalState[NodeState.Dirty]).toBe(true);
    });

    it('자식 노드에서 setGlobalState 호출 시 rootNode에 위임되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            nested: {
              type: 'object',
              properties: {
                value: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node?.find('name');
      const deepNode = node?.find('/nested/value');

      // 자식 노드에서 setGlobalState 호출
      setGlobalState(nameNode,{ customFlag: 'fromName' });
      await wait();

      // root의 globalState가 업데이트되어야 함
      expect(node.globalState.customFlag).toBe('fromName');

      // 더 깊은 자식 노드에서도 동일하게 동작
      setGlobalState(deepNode,{ anotherFlag: 'fromDeep' });
      await wait();

      expect(node.globalState.anotherFlag).toBe('fromDeep');
    });

    it('setGlobalState 호출 시 UpdateGlobalState 이벤트가 발생해야 함', async () => {
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

      const listener = vi.fn();
      node.subscribe(listener);

      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      const updateFormStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents.length).toBeGreaterThan(0);

      const eventPayload =
        updateFormStateEvents[0][0].payload[NodeEventType.UpdateGlobalState];
      expect(eventPayload[NodeState.Dirty]).toBe(true);
    });

    it('동일한 값 설정 시 이벤트가 발생하지 않아야 함', async () => {
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

      // 먼저 상태 설정
      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      const listener = vi.fn();
      node.subscribe(listener);

      // 동일한 값으로 다시 설정
      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      const updateFormStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents).toHaveLength(0);
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

      setGlobalState(node,{
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        customKey: 'value',
      });
      await wait();

      expect(node.globalState).toEqual({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        customKey: 'value',
      });
    });

    it('기존 globalState 값을 유지하면서 새 값을 추가해야 함', async () => {
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

      setGlobalState(node,{ firstKey: 'first' });
      await wait();

      setGlobalState(node,{ secondKey: 'second' });
      await wait();

      expect(node.globalState.firstKey).toBe('first');
      expect(node.globalState.secondKey).toBe('second');
    });
  });

  describe('setState → globalState 연동', () => {
    it('setState 호출 시 globalState도 업데이트되어야 함', async () => {
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

      const nameNode = node?.find('name');

      // 자식 노드에서 setState 호출
      nameNode?.setState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
      await wait();

      // root의 globalState에도 반영되어야 함
      expect(node.globalState[NodeState.Dirty]).toBe(true);
      expect(node.globalState[NodeState.Touched]).toBe(true);
    });

    it('여러 노드의 setState가 globalState에 병합되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node?.find('name');
      const emailNode = node?.find('email');

      // 첫 번째 노드에서 setState
      nameNode?.setState({ [NodeState.Dirty]: true });
      await wait();

      // 두 번째 노드에서 setState (다른 플래그)
      emailNode?.setState({ [NodeState.Touched]: true });
      await wait();

      // 둘 다 globalState에 병합되어야 함
      expect(node.globalState[NodeState.Dirty]).toBe(true);
      expect(node.globalState[NodeState.Touched]).toBe(true);
    });

    it('setState와 setGlobalState 이벤트가 모두 발생해야 함', async () => {
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

      const nameNode = node?.find('name');
      const listener = vi.fn();
      nameNode?.subscribe(listener);

      nameNode?.setState({ [NodeState.Dirty]: true });
      await wait();

      // UpdateState 이벤트 확인
      const updateStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateState,
      );
      expect(updateStateEvents.length).toBeGreaterThan(0);

      // UpdateGlobalState 이벤트도 발생해야 함 (root에서)
      const rootListener = vi.fn();
      node.subscribe(rootListener);

      nameNode?.setState({ [NodeState.ShowError]: true });
      await wait();

      const updateFormStateEvents = rootListener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents.length).toBeGreaterThan(0);
    });
  });

  describe('globalState 누적 및 초기화', () => {
    it('하위 노드의 모든 state 변화가 globalState에 누적되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            age: { type: 'number' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node?.find('name');
      const emailNode = node?.find('email');
      const ageNode = node?.find('age');

      // 각 노드에서 다른 상태 설정
      nameNode?.setState({ [NodeState.Dirty]: true });
      await wait();

      emailNode?.setState({ [NodeState.Touched]: true });
      await wait();

      ageNode?.setState({ [NodeState.ShowError]: true });
      await wait();

      // 모든 상태가 globalState에 누적되어야 함
      expect(node.globalState[NodeState.Dirty]).toBe(true);
      expect(node.globalState[NodeState.Touched]).toBe(true);
      expect(node.globalState[NodeState.ShowError]).toBe(true);
    });

    it('한번 true가 된 값은 false로 되돌릴 수 없어야 함', async () => {
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

      // globalState에 true 설정
      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();
      expect(node.globalState[NodeState.Dirty]).toBe(true);

      const globalStateAfterTrue = node.globalState;

      // false로 되돌리려고 시도
      setGlobalState(node,{ [NodeState.Dirty]: false });
      await wait();

      // 여전히 true여야 함 (되돌릴 수 없음)
      expect(node.globalState[NodeState.Dirty]).toBe(true);
      // 변경이 없으므로 참조도 동일해야 함
      expect(node.globalState).toBe(globalStateAfterTrue);
    });

    it('falsy 값(false, 0, "", null)으로는 기존 truthy 값을 덮어쓸 수 없어야 함', async () => {
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

      // truthy 값 설정
      setGlobalState(node,{
        flag1: true,
        flag2: 'active',
        flag3: 1,
      });
      await wait();

      const globalStateAfterSet = node.globalState;

      // falsy 값으로 덮어쓰기 시도
      setGlobalState(node,{
        flag1: false,
        flag2: '',
        flag3: 0,
      });
      await wait();

      // 모든 값이 유지되어야 함
      expect(node.globalState.flag1).toBe(true);
      expect(node.globalState.flag2).toBe('active');
      expect(node.globalState.flag3).toBe(1);
      // 변경이 없으므로 참조도 동일
      expect(node.globalState).toBe(globalStateAfterSet);
    });

    it('자식 노드에서 setState로 false 설정해도 globalState의 true는 유지되어야 함', async () => {
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

      const nameNode = node?.find('name');

      // 자식 노드에서 true로 설정
      nameNode?.setState({ [NodeState.Dirty]: true });
      await wait();
      expect(node.globalState[NodeState.Dirty]).toBe(true);

      // 자식 노드에서 false로 변경 (자식의 state는 변경됨)
      nameNode?.setState({ [NodeState.Dirty]: false });
      await wait();

      // 자식의 state는 false가 됨
      expect(nameNode?.state[NodeState.Dirty]).toBe(false);
      // 하지만 globalState는 여전히 true
      expect(node.globalState[NodeState.Dirty]).toBe(true);
    });

    it('setGlobalState(undefined)로 globalState를 초기화할 수 있어야 함', async () => {
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

      // 여러 상태 설정
      setGlobalState(node,{
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        [NodeState.ShowError]: true,
        customFlag: 'value',
      });
      await wait();
      expect(Object.keys(node.globalState).length).toBe(4);

      const listener = vi.fn();
      node.subscribe(listener);

      // undefined로 초기화
      setGlobalState(node,undefined);
      await wait();

      // globalState가 빈 객체가 되어야 함
      expect(node.globalState).toEqual({});

      // 이벤트가 발생해야 함
      const updateFormStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents.length).toBeGreaterThan(0);
    });

    it('이미 빈 globalState에 undefined를 전달하면 이벤트가 발생하지 않아야 함', async () => {
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

      expect(node.globalState).toEqual({});

      const listener = vi.fn();
      node.subscribe(listener);

      // 이미 빈 상태에서 undefined 전달
      setGlobalState(node,undefined);
      await wait();

      // 이벤트가 발생하지 않아야 함
      const updateFormStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents).toHaveLength(0);
    });

    it('초기화 후 다시 상태를 설정할 수 있어야 함', async () => {
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

      // 상태 설정
      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();
      expect(node.globalState[NodeState.Dirty]).toBe(true);

      // 초기화
      setGlobalState(node,undefined);
      await wait();
      expect(node.globalState).toEqual({});

      // 다시 상태 설정
      setGlobalState(node,{ [NodeState.Touched]: true });
      await wait();
      expect(node.globalState).toEqual({ [NodeState.Touched]: true });
    });

    it('자식 노드에서 setGlobalState(undefined) 호출 시 root의 globalState가 초기화되어야 함', async () => {
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

      const nameNode = node?.find('name');

      // 상태 설정
      setGlobalState(node,{
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
      await wait();
      expect(Object.keys(node.globalState).length).toBe(2);

      // 자식 노드에서 undefined로 초기화
      setGlobalState(nameNode,undefined);
      await wait();

      // root의 globalState가 초기화되어야 함
      expect(node.globalState).toEqual({});
    });
  });

  describe('globalState 불변성 및 이벤트 발화 조건', () => {
    it('globalState 업데이트 시 새 객체 참조를 반환해야 함', async () => {
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

      const originalGlobalState = node.globalState;

      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      // 참조가 달라야 함 (불변성)
      expect(node.globalState).not.toBe(originalGlobalState);
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

      const listener = vi.fn();
      node.subscribe(listener);

      // 초기 globalState 참조 저장
      const initialFormState = node.globalState;
      expect(initialFormState).toEqual({});

      // 첫 번째 변경: 이벤트 발생 + 새 참조
      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      const updateFormStateEvents1 = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents1.length).toBeGreaterThan(0);
      expect(node.globalState).not.toBe(initialFormState); // 새 참조
      expect(node.globalState).toEqual({ [NodeState.Dirty]: true });

      const globalStateAfterFirst = node.globalState;

      // 동일한 값 설정: 이벤트 미발생 + 참조 유지
      listener.mockClear();
      setGlobalState(node,{ [NodeState.Dirty]: true });
      await wait();

      const updateFormStateEvents2 = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents2).toHaveLength(0);
      expect(node.globalState).toBe(globalStateAfterFirst); // 참조 동일

      // 다른 값 추가: 이벤트 발생 + 새 참조
      listener.mockClear();
      setGlobalState(node,{ [NodeState.Touched]: true });
      await wait();

      const updateFormStateEvents3 = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents3.length).toBeGreaterThan(0);
      expect(node.globalState).not.toBe(globalStateAfterFirst); // 새 참조
      expect(node.globalState).toEqual({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
    });

    it('자식 노드에서 setFormState 호출 시에도 동일한 불변성 규칙이 적용되어야 함', async () => {
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

      const nameNode = node?.find('name');
      const listener = vi.fn();
      node.subscribe(listener);

      const initialFormState = node.globalState;

      // 자식 노드에서 setGlobalState 호출: 이벤트 발생 + 새 참조
      setGlobalState(nameNode,{ customFlag: 'test' });
      await wait();

      const updateFormStateEvents1 = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents1.length).toBeGreaterThan(0);
      expect(node.globalState).not.toBe(initialFormState);

      const globalStateAfterFirst = node.globalState;

      // 동일한 값 설정: 이벤트 미발생 + 참조 유지
      listener.mockClear();
      setGlobalState(nameNode,{ customFlag: 'test' });
      await wait();

      const updateFormStateEvents2 = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateFormStateEvents2).toHaveLength(0);
      expect(node.globalState).toBe(globalStateAfterFirst);
    });
  });
});
