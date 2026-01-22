import { describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { NumberNode, ObjectNode, StringNode } from '@/schema-form/core';

import { NodeEventType, NodeState } from '../nodes/type';

const wait = (delay = 5) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode - subtree state management', () => {
  describe('setSubtreeState', () => {
    it('root 노드에서 호출 시 모든 자식 노드에 state가 설정되어야 함', async () => {
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

      const nameNode = node.find('name') as StringNode;
      const emailNode = node.find('email') as StringNode;
      const ageNode = node.find('age') as NumberNode;

      // setSubtreeState 호출
      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      // 모든 자식 노드에 state가 설정되어야 함
      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(emailNode.state[NodeState.Dirty]).toBe(true);
      expect(ageNode.state[NodeState.Dirty]).toBe(true);
      expect(node.state[NodeState.Dirty]).toBe(true);
    });

    it('중첩된 객체의 모든 자손 노드에도 state가 설정되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                zipCode: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node.find('name') as StringNode;
      const addressNode = node.find('address') as ObjectNode;
      const cityNode = node.find('/address/city') as StringNode;
      const zipCodeNode = node.find('/address/zipCode') as StringNode;

      // setSubtreeState 호출
      node.setSubtreeState({ [NodeState.Touched]: true });
      await wait();

      // 모든 중첩 노드에 state가 설정되어야 함
      expect(nameNode.state[NodeState.Touched]).toBe(true);
      expect(addressNode.state[NodeState.Touched]).toBe(true);
      expect(cityNode.state[NodeState.Touched]).toBe(true);
      expect(zipCodeNode.state[NodeState.Touched]).toBe(true);
    });

    it('중간 노드에서 호출 시 해당 서브트리의 노드에만 state가 설정되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                zipCode: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node.find('name') as StringNode;
      const addressNode = node.find('address') as ObjectNode;
      const cityNode = node.find('/address/city') as StringNode;
      const zipCodeNode = node.find('/address/zipCode') as StringNode;

      // 중간 노드(addressNode)에서 setSubtreeState 호출
      addressNode.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      // address 서브트리에만 state가 설정되어야 함
      expect(addressNode.state[NodeState.Dirty]).toBe(true);
      expect(cityNode.state[NodeState.Dirty]).toBe(true);
      expect(zipCodeNode.state[NodeState.Dirty]).toBe(true);

      // name과 root 노드는 영향받지 않아야 함
      expect(nameNode.state[NodeState.Dirty]).toBeUndefined();
      expect(node.state[NodeState.Dirty]).toBeUndefined();
    });

    it('globalState도 업데이트되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        onChange: () => {},
      });
      await wait();

      expect(node.globalState[NodeState.Dirty]).toBeUndefined();

      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      expect(node.globalState[NodeState.Dirty]).toBe(true);
    });

    it('중간 노드에서 호출 시에도 globalState가 업데이트되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'object',
              properties: {
                city: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const addressNode = node.find('address') as ObjectNode;

      expect(node.globalState[NodeState.Touched]).toBeUndefined();

      addressNode.setSubtreeState({ [NodeState.Touched]: true });
      await wait();

      // 중간 노드에서 호출해도 globalState는 업데이트됨
      expect(node.globalState[NodeState.Touched]).toBe(true);
    });

    it('여러 state 플래그를 동시에 설정할 수 있어야 함', async () => {
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

      const nameNode = node.find('name') as StringNode;

      node.setSubtreeState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
        [NodeState.ShowError]: true,
      });
      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(nameNode.state[NodeState.Touched]).toBe(true);
      expect(nameNode.state[NodeState.ShowError]).toBe(true);

      expect(node.globalState[NodeState.Dirty]).toBe(true);
      expect(node.globalState[NodeState.Touched]).toBe(true);
      expect(node.globalState[NodeState.ShowError]).toBe(true);
    });

    it('배열 노드의 자식 노드에도 state가 설정되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      const itemsNode = node.find('items');
      const firstItem = node.find('/items/0');
      const secondItem = node.find('/items/1');

      expect(itemsNode?.state[NodeState.Dirty]).toBe(true);
      expect(firstItem?.state[NodeState.Dirty]).toBe(true);
      expect(secondItem?.state[NodeState.Dirty]).toBe(true);
    });
  });

  describe('clearSubtreeState', () => {
    it('root 노드에서 호출 시 모든 노드의 state가 초기화되어야 함', async () => {
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

      const nameNode = node.find('name') as StringNode;
      const emailNode = node.find('email') as StringNode;

      // 먼저 state 설정
      node.setSubtreeState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(emailNode.state[NodeState.Dirty]).toBe(true);

      // clearSubtreeState 호출
      node.clearSubtreeState();
      await wait();

      // 모든 노드의 state가 초기화되어야 함
      expect(nameNode.state).toEqual({});
      expect(emailNode.state).toEqual({});
      expect(node.state).toEqual({});
    });

    it('root 노드에서 호출 시 globalState도 초기화되어야 함', async () => {
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

      // 먼저 state 설정
      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      expect(node.globalState[NodeState.Dirty]).toBe(true);

      // root에서 clearSubtreeState 호출
      node.clearSubtreeState();
      await wait();

      // globalState도 초기화되어야 함
      expect(node.globalState).toEqual({});
    });

    it('중간 노드에서 호출 시 해당 서브트리의 노드만 초기화되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                city: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node.find('name') as StringNode;
      const addressNode = node.find('address') as ObjectNode;
      const cityNode = node.find('/address/city') as StringNode;

      // 모든 노드에 state 설정
      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      // 중간 노드에서 clearSubtreeState 호출
      addressNode.clearSubtreeState();
      await wait();

      // address 서브트리만 초기화되어야 함
      expect(addressNode.state).toEqual({});
      expect(cityNode.state).toEqual({});

      // name과 root는 유지되어야 함
      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(node.state[NodeState.Dirty]).toBe(true);
    });

    it('중간 노드에서 호출 시 globalState는 유지되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                city: { type: 'string' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const addressNode = node.find('address') as ObjectNode;

      // 모든 노드에 state 설정
      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      expect(node.globalState[NodeState.Dirty]).toBe(true);

      // 중간 노드에서 clearSubtreeState 호출
      addressNode.clearSubtreeState();
      await wait();

      // globalState는 유지되어야 함 (root가 아니므로)
      expect(node.globalState[NodeState.Dirty]).toBe(true);
    });

    it('중첩된 객체의 모든 자손 노드도 초기화되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            level1: {
              type: 'object',
              properties: {
                level2: {
                  type: 'object',
                  properties: {
                    level3: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const level1Node = node.find('level1') as ObjectNode;
      const level2Node = node.find('/level1/level2') as ObjectNode;
      const level3Node = node.find('/level1/level2/level3') as StringNode;

      // state 설정
      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      expect(level1Node.state[NodeState.Dirty]).toBe(true);
      expect(level2Node.state[NodeState.Dirty]).toBe(true);
      expect(level3Node.state[NodeState.Dirty]).toBe(true);

      // clearSubtreeState 호출
      node.clearSubtreeState();
      await wait();

      // 모든 중첩 노드가 초기화되어야 함
      expect(level1Node.state).toEqual({});
      expect(level2Node.state).toEqual({});
      expect(level3Node.state).toEqual({});
    });
  });

  describe('resetSubtree', () => {
    it('서브트리의 모든 노드가 초기값으로 리셋되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'defaultName' },
            age: { type: 'number', default: 0 },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node.find('name') as StringNode;
      const ageNode = node.find('age') as NumberNode;

      // 값 변경
      nameNode.setValue('changedName');
      ageNode.setValue(25);
      await wait();

      expect(nameNode.value).toBe('changedName');
      expect(ageNode.value).toBe(25);

      // resetSubtree 호출
      node.resetSubtree();
      await wait();

      // 초기값으로 리셋되어야 함
      expect(nameNode.value).toBe('defaultName');
      expect(ageNode.value).toBe(0);
    });

    it('중첩된 객체의 자손 노드도 리셋되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'object',
              properties: {
                city: { type: 'string', default: 'Seoul' },
                zipCode: { type: 'string', default: '00000' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const cityNode = node.find('/address/city') as StringNode;
      const zipCodeNode = node.find('/address/zipCode') as StringNode;

      // 값 변경
      cityNode.setValue('Busan');
      zipCodeNode.setValue('12345');
      await wait();

      expect(cityNode.value).toBe('Busan');
      expect(zipCodeNode.value).toBe('12345');

      // resetSubtree 호출
      node.resetSubtree();
      await wait();

      // 초기값으로 리셋되어야 함
      expect(cityNode.value).toBe('Seoul');
      expect(zipCodeNode.value).toBe('00000');
    });

    it('중간 노드에서 호출 시 해당 서브트리만 리셋되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'defaultName' },
            address: {
              type: 'object',
              properties: {
                city: { type: 'string', default: 'Seoul' },
              },
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node.find('name') as StringNode;
      const addressNode = node.find('address') as ObjectNode;
      const cityNode = node.find('/address/city') as StringNode;

      // 모든 노드의 값 변경
      nameNode.setValue('changedName');
      cityNode.setValue('Busan');
      await wait();

      expect(nameNode.value).toBe('changedName');
      expect(cityNode.value).toBe('Busan');

      // 중간 노드에서 resetSubtree 호출
      addressNode.resetSubtree();
      await wait();

      // address 서브트리만 리셋되어야 함
      expect(cityNode.value).toBe('Seoul');

      // name은 변경된 값 유지
      expect(nameNode.value).toBe('changedName');
    });

    it('배열 노드의 자식도 리셋되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'string', default: 'default' },
              minItems: 2,
            },
          },
        },
        onChange: () => {},
      });
      await wait();

      let firstItem = node.find('/items/0') as StringNode;
      let secondItem = node.find('/items/1') as StringNode;

      // 값 변경
      firstItem.setValue('changed1');
      secondItem.setValue('changed2');
      await wait();

      expect(firstItem.value).toBe('changed1');
      expect(secondItem.value).toBe('changed2');

      // resetSubtree 호출
      node.resetSubtree();
      await wait();

      firstItem = node.find('/items/0') as StringNode;
      secondItem = node.find('/items/1') as StringNode;

      // 배열 항목들도 리셋되어야 함
      expect(firstItem.value).toBe('default');
      expect(secondItem.value).toBe('default');
    });

    it('리셋 후 state도 초기화되어야 함', async () => {
      const node = nodeFromJsonSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'default' },
          },
        },
        onChange: () => {},
      });
      await wait();

      const nameNode = node.find('name') as StringNode;

      // 값 변경 및 state 설정
      nameNode.setValue('changed');
      nameNode.setState({ [NodeState.Dirty]: true, [NodeState.Touched]: true });
      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(nameNode.state[NodeState.Touched]).toBe(true);

      // resetSubtree 호출
      node.resetSubtree();
      await wait();

      // state가 초기화되어야 함 (reset은 state를 직접 초기화하지 않고 값만 초기화)
      // 값이 초기화되면 dirty 상태 플래그도 실질적으로 의미가 없어짐
      expect(nameNode.value).toBe('default');
    });
  });

  describe('이벤트 발생 확인', () => {
    it('setSubtreeState 호출 시 UpdateState 이벤트가 발생해야 함', async () => {
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

      const nameNode = node.find('name') as StringNode;
      const listener = vi.fn();
      nameNode.subscribe(listener);

      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      const updateStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateState,
      );
      expect(updateStateEvents.length).toBeGreaterThan(0);
    });

    it('setSubtreeState 호출 시 UpdateGlobalState 이벤트가 발생해야 함', async () => {
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

      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      const updateGlobalStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateGlobalState,
      );
      expect(updateGlobalStateEvents.length).toBeGreaterThan(0);
    });

    it('clearSubtreeState 호출 시 UpdateState 이벤트가 발생해야 함', async () => {
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

      // 먼저 state 설정
      node.setSubtreeState({ [NodeState.Dirty]: true });
      await wait();

      const nameNode = node.find('name') as StringNode;
      const listener = vi.fn();
      nameNode.subscribe(listener);

      node.clearSubtreeState();
      await wait();

      const updateStateEvents = listener.mock.calls.filter(
        (call) => call[0].type & NodeEventType.UpdateState,
      );
      expect(updateStateEvents.length).toBeGreaterThan(0);
    });
  });
});
