import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import type {
  BranchNodeConstructorProps,
  SchemaNode,
  UnionSetValueOption,
} from '../type';
import { BranchStrategy, type ObjectNodeStrategy } from './strategies';

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
  get children() {
    return this.#strategy.children;
  }

  /**
   * 객체 노드의 값을 가져옵니다.
   * @returns 객체 값 또는 undefined
   */
  get value() {
    return this.#strategy.value;
  }
  /**
   * 객체 노드의 값을 설정합니다.
   * @param input - 설정할 객체 값
   */
  set value(input: ObjectValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 객체 노드에 적용합니다.
   * @param input - 설정할 객체 값
   * @param option - 설정 옵션
   */
  protected applyValue(
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
  activateLink(this: ObjectNode, actor?: SchemaNode): boolean {
    if (super.activateLink(actor)) {
      this.#strategy.activateLink?.();
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
      ajv,
    });

    const handleChange = (value: ObjectValue | undefined) =>
      this.onChange(value);
    const handleRefresh = (value: ObjectValue | undefined) =>
      this.refresh(value);
    const handleSetDefaultValue = (value: ObjectValue | undefined) =>
      this.setDefaultValue(value);
    const handleUpdateComputedProperties = () =>
      this.updateComputedProperties();

    this.#strategy = new BranchStrategy(
      this,
      handleChange,
      handleRefresh,
      handleSetDefaultValue,
      handleUpdateComputedProperties,
      nodeFactory,
    );

    this.activateLink();
  }
}
