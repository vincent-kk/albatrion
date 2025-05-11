import {
  getObjectKeys,
  isEmptyObject,
  sortObjectKeys,
} from '@winglet/common-utils';

import type { ObjectSchema, ObjectValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  type BranchNodeConstructorProps,
  NodeEventType,
  type SchemaNode,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';
import type { ChildNode } from './type';
import {
  type FieldConditionMap,
  getChildNodeMap,
  getChildren,
  getFieldConditionMap,
  getOneOfChildrenList,
  getOneOfKeyInfo,
  getVirtualReferencesMap,
  processValueWithCondition,
  processValueWithOneOfSchema,
} from './utils';

const RESET_NODE_OPTION = SetValueOption.Replace | SetValueOption.Propagate;

/**
 * 객체 스키마를 처리하기 위한 노드 클래스입니다.
 * 객체의 프로퍼티를 관리하고 oneOf와 같은 복잡한 스키마를 처리합니다.
 */
export class ObjectNode extends AbstractNode<ObjectSchema, ObjectValue> {
  readonly #schemaKeys: string[];
  readonly #oneOfKeySet: Set<string> | undefined;
  readonly #oneOfKeySetList: Array<Set<string>> | undefined;
  readonly #fieldConditionMap: FieldConditionMap | undefined;

  #locked: boolean = true;

  #propertyChildren: ChildNode[];

  #oneOfChildrenList: Array<ChildNode[]> | undefined;

  #children: ChildNode[];
  /**
   * 객체 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  get children() {
    return this.#children;
  }

  #value: ObjectValue | undefined;
  #draft: ObjectValue | undefined;

  #internalEvent: boolean = true;

  /**
   * 객체 노드의 값을 가져옵니다.
   * @returns 객체 값 또는 undefined
   */
  get value() {
    return this.#value;
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
    this.#draft = input;
    this.#internalEvent = !(option & SetValueOption.ExternalEvent);
    this.#publishRequestEmitChange(option);
  }

  /**
   * 입력값을 파싱하여 객체로 처리합니다.
   * @param input - 파싱할 객체
   * @returns 파싱된 객체
   */
  #parseValue(this: ObjectNode, input: ObjectValue) {
    const value = sortObjectKeys(input, this.#schemaKeys, true);
    if (this.#internalEvent) return value;
    return processValueWithCondition(value, this.#fieldConditionMap);
  }
  /**
   * 값 변경을 하위 노드로 전파합니다.
   * @param replace - 기존 값 대체 여부
   * @param option - 설정 옵션
   */
  #propagate(this: ObjectNode, replace: boolean, option: UnionSetValueOption) {
    this.#locked = true;
    const target = this.#value || {};
    const draft = this.#draft || {};
    for (let i = 0; i < this.#children.length; i++) {
      const node = this.#children[i].node;
      if (node.type === 'virtual') continue;
      const key = node.propertyKey;
      if (replace || (key in draft && key in target))
        node.setValue(target[key], option);
    }
    this.#locked = false;
  }
  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param option - 설정 옵션
   */
  #emitChange(
    this: ObjectNode,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    if (this.#locked) return;

    const replace = !!(option & SetValueOption.Replace);
    const previous = this.#value ? { ...this.#value } : undefined;

    if (this.#draft === undefined) {
      this.#value = undefined;
    } else if (replace || this.#value === undefined) {
      this.#value = this.#parseValue(this.#draft);
    } else {
      this.#value = this.#parseValue({
        ...this.#value,
        ...this.#draft,
      });
    }
    this.#value = isEmptyObject(this.#value) ? undefined : this.#value;

    if (option & SetValueOption.EmitChange) this.onChange(this.#value);
    if (option & SetValueOption.ExternalEvent) this.updateComputedProperties();
    if (option & SetValueOption.Propagate) this.#propagate(replace, option);
    if (option & SetValueOption.Refresh) this.refresh(this.#value);
    if (option & SetValueOption.PublishEvent)
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
    this.#draft = {};
  }

  /**
   * 노드를 초기화하고 자식 노드를 준비합니다.
   * @param actor - 준비를 요청한 노드
   * @returns 초기화 완료 여부
   */
  activateLink(this: ObjectNode, actor?: SchemaNode): boolean {
    if (super.activateLink(actor)) {
      for (const child of this.#propertyChildren)
        (child.node as AbstractNode).activateLink(this);
      if (this.#oneOfChildrenList)
        for (const children of this.#oneOfChildrenList)
          for (const child of children)
            (child.node as AbstractNode).activateLink(this);
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

    this.#value = this.defaultValue;
    this.#draft = {};

    this.#fieldConditionMap = getFieldConditionMap(jsonSchema);
    const properties = jsonSchema.properties;
    const propertyKeys = getObjectKeys(properties);
    const oneOfKeyInfo = getOneOfKeyInfo(jsonSchema);

    if (oneOfKeyInfo) {
      this.#oneOfKeySet = oneOfKeyInfo.oneOfKeySet;
      this.#oneOfKeySetList = oneOfKeyInfo.oneOfKeySetList;
      this.#schemaKeys = [...propertyKeys, ...Array.from(this.#oneOfKeySet)];
    } else this.#schemaKeys = propertyKeys;

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(name, propertyKeys, jsonSchema.virtual);

    const handelChangeFactory = (propertyKey: string) => (input: any) => {
      if (!this.#draft) this.#draft = {};
      const value =
        typeof input === 'function' ? input(this.#draft[propertyKey]) : input;
      if (value !== undefined && this.#draft[propertyKey] === value) return;
      this.#draft[propertyKey] = value;
      this.#publishRequestEmitChange();
    };

    this.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange)
        this.#emitChange(payload?.[NodeEventType.RequestEmitChange]);
    });

    const childNodeMap = getChildNodeMap(
      this,
      jsonSchema,
      propertyKeys,
      this.defaultValue,
      this.#fieldConditionMap,
      virtualReferenceFieldsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#propertyChildren = getChildren(
      this,
      propertyKeys,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      nodeFactory,
    );

    this.#oneOfChildrenList = getOneOfChildrenList(
      this,
      jsonSchema,
      this.defaultValue,
      childNodeMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#children = this.#propertyChildren;

    this.#locked = false;

    this.#emitChange();
    this.#publishChildrenChange();

    this.setDefaultValue(this.#value);

    this.#prepareOneOfChildren();
    this.activateLink();
  }

  #previousIndex: number | undefined;
  /**
   * oneOf 스키마에 대한 자식 노드를 준비합니다.
   */
  #prepareOneOfChildren(this: ObjectNode) {
    if (!this.#oneOfChildrenList) return;
    this.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const targetIndex = this.oneOfIndex;
        if (this.#internalEvent && targetIndex === this.#previousIndex) return;

        const previousOneOfChildren =
          targetIndex > -1 ? this.#oneOfChildrenList?.[targetIndex] : undefined;
        if (previousOneOfChildren)
          for (const { node } of previousOneOfChildren)
            if (this.#internalEvent) node.resetNode();
            else node.resetNode(this.#value?.[node.propertyKey]);

        const oneOfChildren =
          targetIndex > -1 ? this.#oneOfChildrenList?.[targetIndex] : undefined;
        this.#children = oneOfChildren
          ? [...this.#propertyChildren, ...oneOfChildren]
          : this.#propertyChildren;

        this.#draft = processValueWithOneOfSchema(
          this.#parseValue({
            ...(this.#value || {}),
            ...(this.#draft || {}),
          }),
          this.#oneOfKeySet,
          targetIndex > -1 ? this.#oneOfKeySetList?.[targetIndex] : undefined,
        );

        this.#emitChange(RESET_NODE_OPTION);

        this.onChange(this.#value);

        this.#publishChildrenChange();
        this.#previousIndex = targetIndex;
      }
    });
  }

  #publishChildrenChange(this: ObjectNode) {
    if (this.#locked) return;
    this.publish({ type: NodeEventType.UpdateChildren });
  }

  #publishRequestEmitChange(this: ObjectNode, option?: UnionSetValueOption) {
    if (this.#locked) return;
    this.publish({
      type: NodeEventType.RequestEmitChange,
      payload: {
        [NodeEventType.RequestEmitChange]: option,
      },
    });
  }
}
