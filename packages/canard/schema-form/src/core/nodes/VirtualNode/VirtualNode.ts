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
  private __value__: VirtualNodeValue | undefined = [];
  /**
   * 가상 노드의 값을 가져옵니다.
   * @returns 참조되는 모든 노드의 값 배열 또는 undefined
   */
  public override get value() {
    return this.__value__;
  }
  /**
   * 가상 노드의 값을 설정합니다.
   * @param input - 설정할 값
   */
  public override set value(input: VirtualNodeValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 가상 노드에 적용합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  protected override applyValue(
    this: VirtualNode,
    input: VirtualNodeValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.__emitChange__(input, option);
  }

  private __refNodes__: SchemaNode[] = [];
  private __children__: { node: SchemaNode }[];
  /**
   * 가상 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  override get children() {
    return this.__children__;
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
    required,
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
      required,
      ajv,
    });

    this.__refNodes__ = refNodes || [];

    if (this.defaultValue !== undefined) this.__value__ = this.defaultValue;

    for (let index = 0; index < this.__refNodes__.length; index++) {
      const node = this.__refNodes__[index];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const onChangePayload = payload?.[NodeEventType.UpdateValue];
          if (this.__value__ && this.__value__[index] !== onChangePayload) {
            const previous = this.__value__;
            this.__value__ = [...this.__value__];
            this.__value__[index] = onChangePayload;
            this.publish({
              type: NodeEventType.UpdateValue,
              payload: { [NodeEventType.UpdateValue]: this.__value__ },
              options: {
                [NodeEventType.UpdateValue]: {
                  previous,
                  current: this.__value__,
                },
              },
            });
          }
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.__children__ = map(this.__refNodes__, (node) => ({ node }));

    this.publish({ type: NodeEventType.UpdateChildren });
    this.activate();
  }

  /**
   * 값 변경을 참조 노드들에 전파하고 관련 이벤트를 발행합니다.
   * @param values - 설정할 값
   * @param option - 설정 옵션
   */
  private __emitChange__(
    this: VirtualNode,
    values: VirtualNodeValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    if (!values || values.length !== this.__refNodes__.length) return;
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const node = this.__refNodes__[i];
      if (node.value !== value) node.setValue(value, option);
    }
    if (option & SetValueOption.Refresh) this.refresh(values);
  }
}
