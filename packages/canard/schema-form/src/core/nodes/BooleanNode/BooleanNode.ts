import type { BooleanSchema, BooleanValue } from '@/schema-form/types';

import { parseBoolean } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * 부울린 스키마를 처리하기 위한 노드 클래스입니다.
 * 부울린 값을 관리하고 파싱합니다.
 */
export class BooleanNode extends AbstractNode<BooleanSchema, BooleanValue> {
  #value: BooleanValue | undefined = undefined;
  /**
   * 부울린 노드의 값을 가져옵니다.
   * @returns 부울린 값 또는 undefined
   */
  get value() {
    return this.#value;
  }
  /**
   * 부울린 노드의 값을 설정합니다.
   * @param input - 설정할 부울린 값
   */
  set value(input: BooleanValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 부울린 노드에 적용합니다.
   * @param input - 설정할 부울린 값
   * @param option - 설정 옵션
   */
  protected applyValue(
    this: BooleanNode,
    input: BooleanValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  /**
   * 입력값을 부울린으로 분석합니다.
   * @param input - 분석할 값
   * @returns 분석된 부울린 값
   */
  #parseValue(this: BooleanNode, input: BooleanValue | undefined) {
    return parseBoolean(input);
  }
  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  #emitChange(
    this: BooleanNode,
    input: BooleanValue | undefined,
    option: UnionSetValueOption,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    if (previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange) this.onChange(current);
    if (option & SetValueOption.Refresh) this.refresh(current);

    this.publish({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: current,
      },
      options: {
        [NodeEventType.UpdateValue]: {
          previous,
          current,
        },
      },
    });
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    ajv,
  }: SchemaNodeConstructorProps<BooleanSchema>) {
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
    if (this.defaultValue !== undefined)
      this.setValue(this.defaultValue, SetValueOption.EmitChange);
    this.activateLink();
  }
}
