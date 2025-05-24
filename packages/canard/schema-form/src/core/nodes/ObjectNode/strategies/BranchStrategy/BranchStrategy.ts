import { getObjectKeys, sortObjectKeys } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import type { ChildNode } from '@/schema-form/core/nodes/ObjectNode/type';
import {
  NodeEventType,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import type { ObjectValue } from '@/schema-form/types';

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
  private __host__: ObjectNode;
  private __handleChange__: Fn<[ObjectValue | undefined]>;
  private __handleRefresh__: Fn<[ObjectValue | undefined]>;
  private __handleUpdateComputedProperties__: Fn;

  private readonly __schemaKeys__: string[];
  private readonly __oneOfKeySet__: Set<string> | undefined;
  private readonly __oneOfKeySetList__: Array<Set<string>> | undefined;
  private readonly __fieldConditionMap__: FieldConditionMap | undefined;

  private __locked__: boolean = true;

  private __propertyChildren__: ChildNode[];

  private __oneOfChildrenList__: Array<ChildNode[]> | undefined;

  private __children__: ChildNode[];
  /**
   * 객체 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  public get children() {
    return this.__children__;
  }

  private __value__: ObjectValue | undefined;
  private __draft__: ObjectValue | undefined;

  private __isolationMode__: boolean = false;

  /**
   * 객체의 현재 값을 가져옵니다.
   * @returns 객체 노드의 현재 값 또는 undefined
   */
  public get value() {
    return this.__value__;
  }

  /**
   * 입력값을 객체 노드에 적용합니다.
   * @param input - 설정할 객체 값
   * @param option - 설정 옵션
   */
  public applyValue(input: ObjectValue, option: UnionSetValueOption) {
    this.__draft__ = input;
    this.__isolationMode__ = !!(option & SetValueOption.IsolationMode);
    this.__publishRequestEmitChange__(option);
  }

  /** 하위 노드에 대해 pub-sub 링크를 활성화합니다. */
  public activate() {
    for (const child of this.__propertyChildren__)
      (child.node as AbstractNode).activate(this.__host__);
    if (this.__oneOfChildrenList__)
      for (const children of this.__oneOfChildrenList__)
        for (const child of children)
          (child.node as AbstractNode).activate(this.__host__);
  }

  /**
   * BranchStrategy 객체를 초기화합니다.
   * @param host - 호스트 ObjectNode 객체
   * @param handleChange - 값 변경 핸들러
   * @param handleRefresh - 새로고침 핸들러
   * @param handleSetDefaultValue - 기본값 설정 핸들러
   * @param handleUpdateComputedProperties - 계산된 속성 업데이트 핸들러
   * @param nodeFactory - 노드 생성 팩토리
   */
  constructor(
    host: ObjectNode,
    handleChange: Fn<[ObjectValue | undefined]>,
    handleRefresh: Fn<[ObjectValue | undefined]>,
    handleSetDefaultValue: Fn<[ObjectValue | undefined]>,
    handleUpdateComputedProperties: Fn,
    nodeFactory: SchemaNodeFactory,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;
    this.__handleUpdateComputedProperties__ = handleUpdateComputedProperties;

    this.__value__ = this.__host__.defaultValue;
    this.__draft__ = {};

    const jsonSchema = host.jsonSchema;

    this.__fieldConditionMap__ = getFieldConditionMap(jsonSchema);
    const properties = jsonSchema.properties;
    const propertyKeys = getObjectKeys(properties);
    const oneOfKeyInfo = getOneOfKeyInfo(jsonSchema);

    if (oneOfKeyInfo) {
      this.__oneOfKeySet__ = oneOfKeyInfo.oneOfKeySet;
      this.__oneOfKeySetList__ = oneOfKeyInfo.oneOfKeySetList;
      this.__schemaKeys__ = [
        ...propertyKeys,
        ...Array.from(this.__oneOfKeySet__),
      ];
    } else this.__schemaKeys__ = propertyKeys;

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(host.name, propertyKeys, host.jsonSchema.virtual);
    const handelChangeFactory = (propertyKey: string) => (input: unknown) => {
      if (!this.__draft__) this.__draft__ = {};
      if (input !== undefined && this.__draft__[propertyKey] === input) return;
      this.__draft__[propertyKey] = input;
      this.__publishRequestEmitChange__();
    };
    this.__host__.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange)
        this.__emitChange__(payload?.[NodeEventType.RequestEmitChange]);
    });
    const childNodeMap = getChildNodeMap(
      this.__host__,
      jsonSchema,
      propertyKeys,
      this.__host__.defaultValue,
      this.__fieldConditionMap__,
      virtualReferenceFieldsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.__propertyChildren__ = getChildren(
      this.__host__,
      propertyKeys,
      childNodeMap,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      nodeFactory,
    );

    this.__oneOfChildrenList__ = getOneOfChildrenList(
      this.__host__,
      jsonSchema,
      this.__host__.defaultValue,
      childNodeMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.__children__ = this.__propertyChildren__;

    this.__locked__ = false;

    this.__emitChange__();
    this.__publishChildrenChange__();

    handleSetDefaultValue(this.__value__);

    this.__prepareOneOfChildren__();
  }

  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param option - 설정 옵션
   * @private
   */
  private __emitChange__(option: UnionSetValueOption = SetValueOption.Default) {
    if (this.__locked__) return;

    const replace = !!(option & SetValueOption.Replace);
    const previous = this.__value__ ? { ...this.__value__ } : undefined;

    if (this.__draft__ === undefined) {
      this.__value__ = undefined;
    } else if (replace || this.__value__ === undefined) {
      this.__value__ = this.__parseValue__(this.__draft__);
    } else {
      this.__value__ = this.__parseValue__({
        ...this.__value__,
        ...this.__draft__,
      });
    }

    if (option & SetValueOption.EmitChange)
      this.__handleChange__(this.__value__);
    if (option & SetValueOption.Propagate) this.__propagate__(replace, option);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(this.__value__);
    if (option & SetValueOption.IsolationMode)
      this.__handleUpdateComputedProperties__();
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: this.__value__ },
        options: {
          [NodeEventType.UpdateValue]: {
            previous,
            current: this.__value__,
          },
        },
      });
    this.__draft__ = {};
  }
  /**
   * 입력값을 파싱하여 객체로 처리합니다.
   * @param input - 파싱할 객체
   * @returns 파싱된 객체
   * @private
   */
  private __parseValue__(input: ObjectValue) {
    const value = sortObjectKeys(input, this.__schemaKeys__, true);
    if (this.__isolationMode__)
      return processValueWithCondition(value, this.__fieldConditionMap__);
    return value;
  }
  /**
   * 값 변경을 하위 노드로 전파합니다.
   * @param replace - 기존 값 대체 여부
   * @param option - 설정 옵션
   * @private
   */
  private __propagate__(replace: boolean, option: UnionSetValueOption) {
    this.__locked__ = true;
    const target = this.__value__ || {};
    const draft = this.__draft__ || {};
    for (let i = 0; i < this.__children__.length; i++) {
      const node = this.__children__[i].node;
      if (node.type === 'virtual') continue;
      const key = node.propertyKey;
      if (replace || (key in draft && key in target))
        node.setValue(target[key], option);
    }
    this.__locked__ = false;
  }

  private __previousIndex__: number = -1;
  /**
   * oneOf 스키마의 자식 노드를 준비합니다.
   * @private
   */
  private __prepareOneOfChildren__() {
    if (!this.__oneOfChildrenList__) return;
    this.__host__.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const current = this.__host__.oneOfIndex;
        const previous = this.__previousIndex__;
        if (!this.__isolationMode__ && current === previous) return;

        const previousOneOfChildren =
          previous > -1 ? this.__oneOfChildrenList__?.[previous] : undefined;
        if (previousOneOfChildren)
          for (const { node } of previousOneOfChildren) node.resetNode(false);

        const oneOfChildren =
          current > -1 ? this.__oneOfChildrenList__?.[current] : undefined;
        if (oneOfChildren)
          for (const { node } of oneOfChildren)
            node.resetNode(
              this.__isolationMode__,
              this.__value__?.[node.propertyKey],
            );

        this.__children__ = oneOfChildren
          ? [...this.__propertyChildren__, ...oneOfChildren]
          : this.__propertyChildren__;

        this.__draft__ = processValueWithOneOfSchema(
          this.__parseValue__({
            ...(this.__value__ || {}),
            ...(this.__draft__ || {}),
          }),
          this.__oneOfKeySet__,
          current > -1 ? this.__oneOfKeySetList__?.[current] : undefined,
        );

        this.__emitChange__(RESET_NODE_OPTION);

        this.__handleChange__(this.__value__);

        this.__publishChildrenChange__();
        this.__previousIndex__ = current;
      }
    });
  }

  /**
   * 자식 노드 변경 이벤트를 발행합니다.
   * @private
   */
  private __publishChildrenChange__() {
    if (this.__locked__) return;
    this.__host__.publish({ type: NodeEventType.UpdateChildren });
  }

  /**
   * 값 변경 요청 이벤트를 발행합니다.
   * @param option - 변경 옵션 (선택 사항)
   * @private
   */
  private __publishRequestEmitChange__(option?: UnionSetValueOption) {
    if (this.__locked__) return;
    this.__host__.publish({
      type: NodeEventType.RequestEmitChange,
      payload: { [NodeEventType.RequestEmitChange]: option },
    });
  }
}
