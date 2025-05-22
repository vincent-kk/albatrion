import type { NullSchema, NullValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * null 스키마를 처리하기 위한 노드 클래스입니다.
 * null 값을 관리합니다.
 */
export class NullNode extends AbstractNode<NullSchema, NullValue> {
  #value: NullValue | undefined;
  /**
   * null 노드의 값을 가져옵니다.
   * @returns null 또는 undefined
   */
  get value() {
    return this.#value;
  }
  /**
   * null 노드의 값을 설정합니다.
   * @param input - 설정할 값
   */
  set value(input: NullValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 null 노드에 적용합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  protected applyValue(
    this: NullNode,
    input: NullValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    required,
    ajv,
  }: SchemaNodeConstructorProps<NullSchema>) {
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
    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.activate();
  }

  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  #emitChange(
    this: NullNode,
    input: NullValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    if (previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange) this.onChange(current);
    if (option & SetValueOption.Refresh) this.refresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: {
            previous,
            current,
          },
        },
      });
  }

  /**
   * 입력값을 파싱합니다.
   * @param input - 파싱할 값
   * @returns 그대로 반환
   */
  #parseValue(this: NullNode, input: NullValue | undefined) {
    return input;
  }
}
