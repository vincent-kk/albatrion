import type { NumberSchema, NumberValue } from '@/schema-form/types';

import { parseNumber } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * 숫자 스키마를 처리하기 위한 노드 클래스입니다.
 * 숫자 값(정수 또는 부동소수점)을 관리하고 파싱합니다.
 */
export class NumberNode extends AbstractNode<NumberSchema, NumberValue> {
  #value: NumberValue | undefined = undefined;
  /**
   * 숫자 노드의 값을 가져옵니다.
   * @returns 숫자 값 또는 undefined
   */
  get value() {
    return this.#value;
  }
  /**
   * 숫자 노드의 값을 설정합니다.
   * @param input - 설정할 숫자 값
   */
  set value(input: NumberValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 숫자 노드에 적용합니다.
   * @param input - 설정할 숫자 값
   * @param option - 설정 옵션
   */
  protected applyValue(
    this: NumberNode,
    input: NumberValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  /**
   * 입력값을 숫자로 분석합니다.
   * @param input - 분석할 값
   * @returns 분석된 숫자 값
   */
  #parseValue(this: NumberNode, input: NumberValue | undefined) {
    return parseNumber(input, this.jsonSchema.type === 'integer');
  }
  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  #emitChange(
    this: NumberNode,
    input: NumberValue | undefined,
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
  }: SchemaNodeConstructorProps<NumberSchema>) {
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
    this.prepare();
  }
}
