import { describe, expect, it, vi } from 'vitest';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

import { nodeFromJsonSchema } from '../nodeFromJsonSchema';
import type { BooleanNode } from '../nodes/BooleanNode';
import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import { NodeEventType, NodeState } from '../nodes/type';

const wait = (delay = 10) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
};

describe('AbstractNode - pristine', () => {
  describe('기본 동작', () => {
    it('pristine 표현식이 true일 때 노드의 상태가 초기화되어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          name: {
            type: 'string',
            computed: {
              pristine: '../resetTrigger === true',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // 초기 상태 확인 - 상태가 비어있어야 함
      expect(nameNode.state).toEqual({});

      // name 필드에 값을 입력하여 dirty 상태로 만듦
      nameNode.setValue('test value');
      nameNode.setState({ [NodeState.Dirty]: true, [NodeState.Touched]: true });

      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(nameNode.state[NodeState.Touched]).toBe(true);

      // resetTrigger를 true로 설정하면 pristine이 트리거되어 상태가 초기화됨
      resetTriggerNode.setValue(true);

      await wait();

      // 상태가 초기화되어야 함
      expect(nameNode.state[NodeState.Dirty]).toBeUndefined();
      expect(nameNode.state[NodeState.Touched]).toBeUndefined();
    });

    it('pristine 표현식이 false일 때 상태가 유지되어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          name: {
            type: 'string',
            computed: {
              pristine: '../resetTrigger === true',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;

      // dirty 상태로 만듦
      nameNode.setValue('test value');
      nameNode.setState({ [NodeState.Dirty]: true, [NodeState.Touched]: true });

      await wait();

      // resetTrigger가 false이므로 상태가 유지되어야 함
      expect(nameNode.state[NodeState.Dirty]).toBe(true);
      expect(nameNode.state[NodeState.Touched]).toBe(true);
    });

    it('상수 표현식 true로 pristine 설정 시 초기화 후에는 영향 없음', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            computed: {
              pristine: 'true', // 항상 true
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;

      // 초기 상태 확인
      expect(nameNode.state).toEqual({});

      // dirty 상태로 만듦
      nameNode.setState({ [NodeState.Dirty]: true });

      await wait();

      // pristine이 항상 true이므로 UpdateComputedProperties 이벤트가 발생할 때마다 초기화됨
      // 하지만 값 변경 없이는 UpdateComputedProperties가 발생하지 않을 수 있음
      // 다른 필드 변경으로 트리거
    });
  });

  describe('&pristine 별칭 문법', () => {
    it('&pristine 별칭이 computed.pristine과 동일하게 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          name: {
            type: 'string',
            '&pristine': '../resetTrigger === true',
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // dirty 상태로 만듦
      nameNode.setState({ [NodeState.Dirty]: true, [NodeState.Touched]: true });

      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);

      await wait();

      // 상태가 초기화되어야 함
      expect(nameNode.state[NodeState.Dirty]).toBeUndefined();
      expect(nameNode.state[NodeState.Touched]).toBeUndefined();
    });
  });

  describe('복잡한 표현식', () => {
    it('여러 필드에 의존하는 pristine 표현식이 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          confirmReset: {
            type: 'boolean',
            default: false,
          },
          resetCode: {
            type: 'string',
            default: '',
          },
          data: {
            type: 'string',
            computed: {
              // confirmReset이 true이고 resetCode가 "RESET"일 때만 초기화
              pristine: '../confirmReset === true && ../resetCode === "RESET"',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const dataNode = node?.find('/data') as StringNode;
      const confirmResetNode = node?.find('/confirmReset') as BooleanNode;
      const resetCodeNode = node?.find('/resetCode') as StringNode;

      // dirty 상태로 만듦
      dataNode.setState({ [NodeState.Dirty]: true });

      await wait();
      expect(dataNode.state[NodeState.Dirty]).toBe(true);

      // confirmReset만 true - 아직 초기화되지 않음
      confirmResetNode.setValue(true);
      await wait();
      expect(dataNode.state[NodeState.Dirty]).toBe(true);

      // resetCode를 "RESET"으로 설정 - 이제 초기화됨
      resetCodeNode.setValue('RESET');
      await wait();
      expect(dataNode.state[NodeState.Dirty]).toBeUndefined();
    });

    it('숫자 비교 표현식이 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            default: 0,
          },
          data: {
            type: 'string',
            computed: {
              pristine: '../threshold >= 100',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const dataNode = node?.find('/data') as StringNode;
      const thresholdNode = node?.find('/threshold') as NumberNode;

      // dirty 상태로 만듦
      dataNode.setState({
        [NodeState.Dirty]: true,
        [NodeState.ShowError]: true,
      });
      await wait();
      expect(dataNode.state[NodeState.Dirty]).toBe(true);
      expect(dataNode.state[NodeState.ShowError]).toBe(true);

      // threshold가 100 미만 - 아직 초기화되지 않음
      thresholdNode.setValue(50);
      await wait();
      expect(dataNode.state[NodeState.Dirty]).toBe(true);

      // threshold를 100으로 설정 - 초기화됨
      thresholdNode.setValue(100);
      await wait();
      expect(dataNode.state[NodeState.Dirty]).toBeUndefined();
      expect(dataNode.state[NodeState.ShowError]).toBeUndefined();
    });
  });

  describe('다중 필드 pristine', () => {
    it('여러 필드가 동시에 pristine을 가질 수 있어야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetAll: {
            type: 'boolean',
            default: false,
          },
          field1: {
            type: 'string',
            computed: {
              pristine: '../resetAll',
            },
          },
          field2: {
            type: 'number',
            computed: {
              pristine: '../resetAll',
            },
          },
          field3: {
            type: 'boolean',
            computed: {
              pristine: '../resetAll',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const field1Node = node?.find('/field1') as StringNode;
      const field2Node = node?.find('/field2') as NumberNode;
      const field3Node = node?.find('/field3') as BooleanNode;
      const resetAllNode = node?.find('/resetAll') as BooleanNode;

      // 모든 필드를 dirty 상태로 만듦
      field1Node.setState({ [NodeState.Dirty]: true });
      field2Node.setState({ [NodeState.Dirty]: true });
      field3Node.setState({ [NodeState.Dirty]: true });

      await wait();

      expect(field1Node.state[NodeState.Dirty]).toBe(true);
      expect(field2Node.state[NodeState.Dirty]).toBe(true);
      expect(field3Node.state[NodeState.Dirty]).toBe(true);

      // resetAll을 true로 설정
      resetAllNode.setValue(true);

      await wait();

      // 모든 필드의 상태가 초기화되어야 함
      expect(field1Node.state[NodeState.Dirty]).toBeUndefined();
      expect(field2Node.state[NodeState.Dirty]).toBeUndefined();
      expect(field3Node.state[NodeState.Dirty]).toBeUndefined();
    });
  });

  describe('pristine과 다른 computed 속성 조합', () => {
    it('pristine과 visible이 함께 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          showField: {
            type: 'boolean',
            default: true,
          },
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          conditionalField: {
            type: 'string',
            computed: {
              visible: '../showField',
              pristine: '../resetTrigger',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const conditionalFieldNode = node?.find(
        '/conditionalField',
      ) as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // dirty 상태로 만듦
      conditionalFieldNode.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(conditionalFieldNode.visible).toBe(true);
      expect(conditionalFieldNode.state[NodeState.Dirty]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // visible은 여전히 true이고, 상태는 초기화됨
      expect(conditionalFieldNode.visible).toBe(true);
      expect(conditionalFieldNode.state[NodeState.Dirty]).toBeUndefined();
    });

    it('pristine과 readOnly가 함께 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          isLocked: {
            type: 'boolean',
            default: false,
          },
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          lockedField: {
            type: 'string',
            computed: {
              readOnly: '../isLocked',
              pristine: '../resetTrigger',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const lockedFieldNode = node?.find('/lockedField') as StringNode;
      const isLockedNode = node?.find('/isLocked') as BooleanNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // dirty 상태로 만들고 locked 상태로 설정
      lockedFieldNode.setState({ [NodeState.Dirty]: true });
      isLockedNode.setValue(true);
      await wait();

      expect(lockedFieldNode.readOnly).toBe(true);
      expect(lockedFieldNode.state[NodeState.Dirty]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // readOnly는 여전히 true이고, 상태는 초기화됨
      expect(lockedFieldNode.readOnly).toBe(true);
      expect(lockedFieldNode.state[NodeState.Dirty]).toBeUndefined();
    });

    it('pristine과 derived가 함께 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          price: {
            type: 'number',
            default: 100,
          },
          quantity: {
            type: 'number',
            default: 2,
          },
          total: {
            type: 'number',
            computed: {
              derived: '../price * ../quantity',
              pristine: '../resetTrigger',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const totalNode = node?.find('/total') as NumberNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // derived 값 확인
      expect(totalNode.value).toBe(200);

      // dirty 상태로 만듦
      totalNode.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(totalNode.state[NodeState.Dirty]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // derived 값은 유지되고, 상태만 초기화됨
      expect(totalNode.value).toBe(200);
      expect(totalNode.state[NodeState.Dirty]).toBeUndefined();
    });
  });

  describe('중첩된 객체에서의 pristine', () => {
    it('중첩된 객체 내부 필드에서 pristine이 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          nested: {
            type: 'object',
            properties: {
              innerField: {
                type: 'string',
                computed: {
                  pristine: '/resetTrigger', // 절대 경로 사용
                },
              },
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const innerFieldNode = node?.find('/nested/innerField') as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // dirty 상태로 만듦
      innerFieldNode.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(innerFieldNode.state[NodeState.Dirty]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // 상태가 초기화되어야 함
      expect(innerFieldNode.state[NodeState.Dirty]).toBeUndefined();
    });

    it('상위 경로 참조(../)가 pristine에서 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              resetTrigger: {
                type: 'boolean',
                default: false,
              },
              innerField: {
                type: 'string',
                computed: {
                  pristine: '../resetTrigger', // 상대 경로 사용
                },
              },
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const innerFieldNode = node?.find('/nested/innerField') as StringNode;
      const resetTriggerNode = node?.find(
        '/nested/resetTrigger',
      ) as BooleanNode;

      // dirty 상태로 만듦
      innerFieldNode.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(innerFieldNode.state[NodeState.Dirty]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // 상태가 초기화되어야 함
      expect(innerFieldNode.state[NodeState.Dirty]).toBeUndefined();
    });
  });

  describe('이벤트 발생', () => {
    it('pristine으로 상태 초기화 시 UpdateState 이벤트가 발생해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          name: {
            type: 'string',
            computed: {
              pristine: '../resetTrigger',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // dirty 상태로 만듦
      nameNode.setState({ [NodeState.Dirty]: true });
      await wait();

      // 이벤트 구독
      const stateChangeHandler = vi.fn();
      nameNode.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateState) {
          stateChangeHandler();
        }
      });

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // UpdateState 이벤트가 발생해야 함
      expect(stateChangeHandler).toHaveBeenCalled();
    });
  });

  describe('엣지 케이스', () => {
    it('이미 초기 상태인 노드에서 pristine이 트리거되어도 에러가 발생하지 않아야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          name: {
            type: 'string',
            computed: {
              pristine: '../resetTrigger',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // 이미 초기 상태임
      expect(nameNode.state).toEqual({});

      // resetTrigger를 true로 설정해도 에러가 발생하지 않아야 함
      expect(() => {
        resetTriggerNode.setValue(true);
      }).not.toThrow();

      await wait();

      expect(nameNode.state).toEqual({});
    });

    it('pristine 표현식이 undefined를 반환해도 에러가 발생하지 않아야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          optionalField: {
            type: 'string',
          },
          name: {
            type: 'string',
            computed: {
              pristine: '../optionalField === "reset"', // optionalField가 undefined일 수 있음
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;
      const optionalFieldNode = node?.find('/optionalField') as StringNode;

      // dirty 상태로 만듦
      nameNode.setState({ [NodeState.Dirty]: true });
      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBe(true);

      // optionalField를 설정하여 pristine 트리거
      optionalFieldNode.setValue('reset');
      await wait();

      expect(nameNode.state[NodeState.Dirty]).toBeUndefined();
    });

    it('pristine이 반복적으로 트리거되어도 안정적으로 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          name: {
            type: 'string',
            computed: {
              pristine: '../resetTrigger',
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nameNode = node?.find('/name') as StringNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // 여러 번 반복
      for (let i = 0; i < 5; i++) {
        // dirty 상태로 만듦
        nameNode.setState({ [NodeState.Dirty]: true });
        await wait();
        expect(nameNode.state[NodeState.Dirty]).toBe(true);

        // resetTrigger를 true로 설정
        resetTriggerNode.setValue(true);
        await wait();
        expect(nameNode.state[NodeState.Dirty]).toBeUndefined();

        // resetTrigger를 false로 리셋
        resetTriggerNode.setValue(false);
        await wait();
      }
    });
  });

  describe('ObjectNode pristine', () => {
    it('ObjectNode에서 pristine이 동작해야 함', async () => {
      const onChange = vi.fn();
      const jsonSchema = {
        type: 'object',
        properties: {
          resetTrigger: {
            type: 'boolean',
            default: false,
          },
          nested: {
            type: 'object',
            computed: {
              pristine: '../resetTrigger',
            },
            properties: {
              field1: { type: 'string' },
              field2: { type: 'number' },
            },
          },
        },
      } satisfies JsonSchemaWithVirtual;

      const node = nodeFromJsonSchema({
        jsonSchema,
        onChange,
      });

      await wait();

      const nestedNode = node?.find('/nested') as ObjectNode;
      const resetTriggerNode = node?.find('/resetTrigger') as BooleanNode;

      // nested 노드를 dirty 상태로 만듦
      nestedNode.setState({
        [NodeState.Dirty]: true,
        [NodeState.Touched]: true,
      });
      await wait();

      expect(nestedNode.state[NodeState.Dirty]).toBe(true);
      expect(nestedNode.state[NodeState.Touched]).toBe(true);

      // resetTrigger를 true로 설정
      resetTriggerNode.setValue(true);
      await wait();

      // ObjectNode의 상태가 초기화되어야 함
      expect(nestedNode.state[NodeState.Dirty]).toBeUndefined();
      expect(nestedNode.state[NodeState.Touched]).toBeUndefined();
    });
  });
});
