import type { Fn } from '@aileron/declare';

import type { StringSchema, StringValue } from '@/schema-form/types';

import { parseString } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

/**
 * 문자열 스키마를 처리하기 위한 노드 클래스입니다.
 * 문자열 값을 관리하고 파싱합니다.
 */
export class StringNode extends AbstractNode<StringSchema, StringValue> {
  #value: StringValue | undefined = undefined;
  /**
   * 문자열 노드의 값을 가져옵니다.
   * @returns 문자열 값 또는 undefined
   */
  public override get value() {
    return this.#value;
  }
  /**
   * 문자열 노드의 값을 설정합니다.
   * @param input - 설정할 문자열 값
   */
  public override set value(input: StringValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 문자열 노드에 적용합니다.
   * @param input - 설정할 문자열 값
   * @param option - 설정 옵션
   */
  protected override applyValue(
    this: StringNode,
    input: StringValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  protected override onChange: Fn<[input: StringValue | undefined]>;

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
  }: SchemaNodeConstructorProps<StringSchema>) {
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

    this.onChange =
      this.jsonSchema.options?.omitEmpty !== false
        ? this.onChangeWithOmitEmpty
        : super.onChange;

    if (this.defaultValue !== undefined) this.#emitChange(this.defaultValue);
    this.activate();
  }

  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param input - 설정할 값
   * @param option - 설정 옵션
   */
  #emitChange(
    this: StringNode,
    input: StringValue | undefined,
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
   * 입력값을 문자열로 분석합니다.
   * @param input - 분석할 값
   * @returns 분석된 문자열 값
   */
  #parseValue(this: StringNode, input: StringValue | undefined) {
    return parseString(input);
  }

  /**
   * 빈 값을 제외하고 값 변경을 반영합니다.
   * @param input - 설정할 값
   * @internal 내부 구현용 메서드입니다. 직접 호출하지 마세요.
   */
  private onChangeWithOmitEmpty(
    this: StringNode,
    input: StringValue | undefined,
  ) {
    if (input === undefined || input.length === 0) super.onChange(undefined);
    else super.onChange(input);
  }
}
