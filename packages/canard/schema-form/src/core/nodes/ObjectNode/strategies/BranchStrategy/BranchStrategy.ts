import { getObjectKeys, sortObjectKeys } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ObjectValue } from '@/schema-form/types';

import type { AbstractNode } from '../../../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '../../../type';
import type { ObjectNode } from '../../ObjectNode';
import type { ChildNode } from '../../type';
import type { ObjectNodeStrategy } from '../type';
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

export class BranchStrategy implements ObjectNodeStrategy {
  #host: ObjectNode;
  #handleChange: Fn<[ObjectValue | undefined]>;
  #handleRefresh: Fn<[ObjectValue | undefined]>;
  #handleUpdateComputedProperties: Fn;

  readonly #schemaKeys: string[];
  readonly #oneOfKeySet: Set<string> | undefined;
  readonly #oneOfKeySetList: Array<Set<string>> | undefined;
  readonly #fieldConditionMap: FieldConditionMap | undefined;
  #locked: boolean = true;

  #propertyChildren: ChildNode[];

  #oneOfChildrenList: Array<ChildNode[]> | undefined;

  #children: ChildNode[];
  get children() {
    return this.#children;
  }

  #value: ObjectValue | undefined;
  #draft: ObjectValue | undefined;

  #isolationMode: boolean = false;

  get value() {
    return this.#value;
  }

  applyValue(input: ObjectValue, option: UnionSetValueOption) {
    this.#draft = input;
    this.#isolationMode = !!(option & SetValueOption.IsolationMode);
    this.#publishRequestEmitChange(option);
  }

  /**
   * 노드를 초기화하고 자식 노드를 준비합니다.
   * @param actor - 준비를 요청한 노드
   * @returns 초기화 완료 여부
   */
  activateLink() {
    for (const child of this.#propertyChildren)
      (child.node as AbstractNode).activateLink(this.#host);
    if (this.#oneOfChildrenList)
      for (const children of this.#oneOfChildrenList)
        for (const child of children)
          (child.node as AbstractNode).activateLink(this.#host);
  }
  constructor(
    host: ObjectNode,
    handleChange: Fn<[ObjectValue | undefined]>,
    handleRefresh: Fn<[ObjectValue | undefined]>,
    handleSetDefaultValue: Fn<[ObjectValue | undefined]>,
    handleUpdateComputedProperties: Fn,
    nodeFactory: SchemaNodeFactory,
  ) {
    this.#host = host;
    this.#handleChange = handleChange;
    this.#handleRefresh = handleRefresh;
    this.#handleUpdateComputedProperties = handleUpdateComputedProperties;

    this.#value = this.#host.defaultValue;
    this.#draft = {};

    const jsonSchema = host.jsonSchema;

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
      getVirtualReferencesMap(host.name, propertyKeys, host.jsonSchema.virtual);
    const handelChangeFactory = (propertyKey: string) => (input: unknown) => {
      if (!this.#draft) this.#draft = {};
      if (input !== undefined && this.#draft[propertyKey] === input) return;
      this.#draft[propertyKey] = input;
      this.#publishRequestEmitChange();
    };
    this.#host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange)
        this.#emitChange(payload?.[NodeEventType.RequestEmitChange]);
    });
    const childNodeMap = getChildNodeMap(
      this.#host,
      jsonSchema,
      propertyKeys,
      this.#host.defaultValue,
      this.#fieldConditionMap,
      virtualReferenceFieldsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#propertyChildren = getChildren(
      this.#host,
      propertyKeys,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      nodeFactory,
    );

    this.#oneOfChildrenList = getOneOfChildrenList(
      this.#host,
      jsonSchema,
      this.#host.defaultValue,
      childNodeMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.#children = this.#propertyChildren;

    this.#locked = false;

    this.#emitChange();
    this.#publishChildrenChange();

    handleSetDefaultValue(this.#value);

    this.#prepareOneOfChildren();
  }

  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param option - 설정 옵션
   */
  #emitChange(option: UnionSetValueOption = SetValueOption.Default) {
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

    if (option & SetValueOption.EmitChange) this.#handleChange(this.#value);
    if (option & SetValueOption.Propagate) this.#propagate(replace, option);
    if (option & SetValueOption.Refresh) this.#handleRefresh(this.#value);
    if (option & SetValueOption.IsolationMode)
      this.#handleUpdateComputedProperties();
    if (option & SetValueOption.PublishUpdateEvent)
      this.#host.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: this.#value },
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
   * 입력값을 파싱하여 객체로 처리합니다.
   * @param input - 파싱할 객체
   * @returns 파싱된 객체
   */
  #parseValue(input: ObjectValue) {
    const value = sortObjectKeys(input, this.#schemaKeys, true);
    if (this.#isolationMode)
      return processValueWithCondition(value, this.#fieldConditionMap);
    return value;
  }
  /**
   * 값 변경을 하위 노드로 전파합니다.
   * @param replace - 기존 값 대체 여부
   * @param option - 설정 옵션
   */
  #propagate(replace: boolean, option: UnionSetValueOption) {
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

  #previousIndex: number = -1;
  #prepareOneOfChildren() {
    if (!this.#oneOfChildrenList) return;
    this.#host.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const current = this.#host.oneOfIndex;
        const previous = this.#previousIndex;
        if (!this.#isolationMode && current === previous) return;

        const previousOneOfChildren =
          previous > -1 ? this.#oneOfChildrenList?.[previous] : undefined;
        if (previousOneOfChildren)
          for (const { node } of previousOneOfChildren) node.resetNode(false);

        const oneOfChildren =
          current > -1 ? this.#oneOfChildrenList?.[current] : undefined;
        if (oneOfChildren)
          for (const { node } of oneOfChildren)
            node.resetNode(
              this.#isolationMode,
              this.#value?.[node.propertyKey],
            );

        this.#children = oneOfChildren
          ? [...this.#propertyChildren, ...oneOfChildren]
          : this.#propertyChildren;

        this.#draft = processValueWithOneOfSchema(
          this.#parseValue({
            ...(this.#value || {}),
            ...(this.#draft || {}),
          }),
          this.#oneOfKeySet,
          current > -1 ? this.#oneOfKeySetList?.[current] : undefined,
        );

        this.#emitChange(RESET_NODE_OPTION);

        this.#handleChange(this.#value);

        this.#publishChildrenChange();
        this.#previousIndex = current;
      }
    });
  }

  #publishChildrenChange() {
    if (this.#locked) return;
    this.#host.publish({ type: NodeEventType.UpdateChildren });
  }

  #publishRequestEmitChange(option?: UnionSetValueOption) {
    if (this.#locked) return;
    this.#host.publish({
      type: NodeEventType.RequestEmitChange,
      payload: { [NodeEventType.RequestEmitChange]: option },
    });
  }
}
