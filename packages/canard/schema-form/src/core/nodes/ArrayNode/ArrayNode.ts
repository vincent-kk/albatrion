import type { Fn } from '@aileron/declare';

import type { ArraySchema, ArrayValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  SchemaNode,
  SchemaNodeFactory,
  UnionSetValueOption,
} from '../type';
import {
  type ArrayNodeStrategy,
  BranchStrategy,
  type IndexId,
  TerminalStrategy,
} from './strategies';
import { omitEmptyArray } from './utils';

/**
 * 배열 스키마를 처리하기 위한 노드 클래스입니다.
 * 배열의 각 요소를 관리하고 추가/삭제/업데이트 기능을 제공합니다.
 */
export class ArrayNode extends AbstractNode<ArraySchema, ArrayValue> {
  #strategy: ArrayNodeStrategy;

  /**
   * 배열 노드의 값을 가져옵니다.
   * @returns 배열 값 또는 undefined
   */
  public override get value() {
    return this.#strategy.value;
  }
  /**
   * 배열 노드의 값을 설정합니다.
   * @param input - 설정할 배열 값
   */
  public override set value(input: ArrayValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  protected override applyValue(
    this: ArrayNode,
    input: ArrayValue,
    option: UnionSetValueOption,
  ) {
    this.#strategy.applyValue(input, option);
  }

  /** ArrayNode의 자식 노드들 */
  /**
   * 배열 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  public override get children() {
    return this.#strategy.children;
  }

  /**
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이
   */
  public get length() {
    return this.#strategy.length;
  }

  /**
   * 노드를 초기화하고 자식 노드를 준비합니다.
   * @param actor - 준비를 요청한 노드
   * @returns 초기화 완료 여부
   */
  public override activate(this: ArrayNode, actor?: SchemaNode): boolean {
    if (super.activate(actor)) {
      this.#strategy.activate?.();
      return true;
    }
    return false;
  }

  protected override onChange: Fn<[input: ArrayValue | undefined]>;

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    nodeFactory,
    parentNode,
    validationMode,
    required,
    ajv,
  }: BranchNodeConstructorProps<ArraySchema>) {
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
    const handleChange =
      this.jsonSchema.options?.omitEmpty === false
        ? (value?: ArrayValue) => super.onChange(value)
        : (value?: ArrayValue) => super.onChange(omitEmptyArray(value));
    this.onChange = handleChange;
    this.#strategy = this.#createStrategy(handleChange, nodeFactory);
    this.activate();
  }

  /**
   * 배열에 새 요소를 추가합니다.
   * @param data - 추가할 값 (생략 가능)
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public push(this: ArrayNode, data?: ArrayValue[number]) {
    this.#strategy.push(data);
    return this;
  }

  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public update(
    this: ArrayNode,
    id: IndexId | number,
    data: ArrayValue[number],
  ) {
    this.#strategy.update(id, data);
    return this;
  }

  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public remove(this: ArrayNode, id: IndexId | number) {
    this.#strategy.remove(id);
    return this;
  }

  /**
   * 모든 요소를 삭제하여 배열을 초기화합니다.
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public clear(this: ArrayNode) {
    this.#strategy.clear();
    return this;
  }

  /**
   * 배열 노드의 전략을 생성합니다.
   * @param nodeFactory - 노드 팩토리
   * @returns 생성된 전략: TerminalStrategy | BranchStrategy
   */
  #createStrategy(
    handleChange: Fn<[input: ArrayValue | undefined]>,
    nodeFactory: SchemaNodeFactory,
  ) {
    const handleRefresh = (value?: ArrayValue) => this.refresh(value);
    const handleSetDefaultValue = (value?: ArrayValue) =>
      this.setDefaultValue(value);

    if (this.group === 'terminal') {
      return new TerminalStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
      );
    } else {
      return new BranchStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
        nodeFactory,
      );
    }
  }
}
