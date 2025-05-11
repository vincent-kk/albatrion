import { map } from '@winglet/common-utils';

import type { VirtualNodeValue, VirtualSchema } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNode,
  SetValueOption,
  type UnionSetValueOption,
  type VirtualNodeConstructorProps,
} from '../type';

/**
 * 가상 스키마를 처리하기 위한 노드 클래스입니다.
 * 여러 노드에 참조를 가지고 그들을 통합하여 작동합니다.
 */
export class VirtualNode extends AbstractNode<VirtualSchema, VirtualNodeValue> {
  #value: VirtualNodeValue | undefined = undefined;
  /**
   * 가상 노드의 값을 가져옵니다.
   * @returns 참조되는 모든 노드의 값 배열 또는 undefined
   */
  get value() {
    return this.#value;
  }
  /**
   * 가상 노드의 값을 설정합니다.
   * @param input - 설정할 값
   */
  set value(input: VirtualNodeValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 가상 노드에 적용합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  protected applyValue(
    this: VirtualNode,
    input: VirtualNodeValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  #refNodes: SchemaNode[] = [];
  #children: { node: SchemaNode }[];
  /**
   * 가상 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  get children() {
    return this.#children;
  }

  /**
   * 값 변경을 참조 노드들에 전파하고 관련 이벤트를 발행합니다.
   * @param values - 설정할 값
   * @param option - 설정 옵션
   */
  #emitChange(
    this: VirtualNode,
    values: VirtualNodeValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    if (!values || values.length !== this.#refNodes.length) return;
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const node = this.#refNodes[i];
      if (node.value !== value) node.setValue(value, option);
    }
    if (option & SetValueOption.Refresh) this.refresh(values);
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    refNodes,
    validationMode,
    ajv,
  }: VirtualNodeConstructorProps<VirtualSchema>) {
    super({
      key,
      name,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      ajv,
    });

    this.#refNodes = refNodes || [];

    if (this.defaultValue !== undefined) this.#value = this.defaultValue;

    for (let index = 0; index < this.#refNodes.length; index++) {
      const node = this.#refNodes[index];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const onChangePayload = payload?.[NodeEventType.UpdateValue];
          if (this.#value && this.#value[index] !== onChangePayload) {
            const previous = this.#value;
            this.#value = [...this.#value];
            this.#value[index] = onChangePayload;
            this.publish({
              type: NodeEventType.UpdateValue,
              payload: {
                [NodeEventType.UpdateValue]: this.#value,
              },
              options: {
                [NodeEventType.UpdateValue]: {
                  previous,
                  current: this.#value,
                },
              },
            });
          }
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.#children = map(this.#refNodes, (node) => ({ node }));

    this.publish({ type: NodeEventType.UpdateChildren });
    this.activateLink();
  }
}
