import type { Fn } from '@aileron/declare';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  SchemaNode,
  SchemaNodeFactory,
  UnionSetValueOption,
} from '../type';
import {
  BranchStrategy,
  type ObjectNodeStrategy,
  TerminalStrategy,
} from './strategies';
import { omitEmptyObject } from './utils';

/**
 * 객체 스키마를 처리하기 위한 노드 클래스입니다.
 * 객체의 프로퍼티를 관리하고 oneOf와 같은 복잡한 스키마를 처리합니다.
 */
export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  #strategy: ObjectNodeStrategy;

  /**
   * 객체 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  public override get children() {
    return this.#strategy.children;
  }

  /**
   * 객체 노드의 값을 가져옵니다.
   * @returns 객체 값 또는 undefined
   */
  public override get value() {
    return this.#strategy.value;
  }
  /**
   * 객체 노드의 값을 설정합니다.
   * @param input - 설정할 객체 값
   */
  public override set value(input: ObjectValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 객체 노드에 적용합니다.
   * @param input - 설정할 객체 값
   * @param option - 설정 옵션
   */
  protected override applyValue(
    this: ObjectNode,
    input: ObjectValue,
    option: UnionSetValueOption,
  ) {
    this.#strategy.applyValue(input, option);
  }

  /**
   * 노드를 초기화하고 자식 노드를 준비합니다.
   * @param actor - 준비를 요청한 노드
   * @returns 초기화 완료 여부
   */
  public override activate(this: ObjectNode, actor?: SchemaNode): boolean {
    if (super.activate(actor)) {
      this.#strategy.activate?.();
      return true;
    }
    return false;
  }

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
  }: BranchNodeConstructorProps<ObjectSchema>) {
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
        ? (value?: ObjectValue) => super.onChange(value)
        : (value?: ObjectValue) => super.onChange(omitEmptyObject(value));
    this.onChange = handleChange;
    this.#strategy = this.#createStrategy(handleChange, nodeFactory);
    this.activate();
  }

  /**
   * 객체 노드의 전략을 생성합니다.
   * @param nodeFactory - 노드 팩토리
   * @returns 생성된 전략: TerminalStrategy | BranchStrategy
   */
  #createStrategy(
    handleChange: Fn<[input: ObjectValue | undefined]>,
    nodeFactory: SchemaNodeFactory,
  ) {
    const handleRefresh = (value?: ObjectValue) => this.refresh(value);
    const handleSetDefaultValue = (value?: ObjectValue) =>
      this.setDefaultValue(value);

    if (this.group === 'terminal') {
      return new TerminalStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
      );
    } else {
      const handleUpdateComputedProperties = () =>
        this.updateComputedProperties();
      return new BranchStrategy(
        this,
        handleChange,
        handleRefresh,
        handleSetDefaultValue,
        handleUpdateComputedProperties,
        nodeFactory,
      );
    }
  }
}
