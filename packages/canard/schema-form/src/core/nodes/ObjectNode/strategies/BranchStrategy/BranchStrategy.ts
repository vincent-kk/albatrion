import {
  getObjectKeys,
  sortObjectKeys,
  sortWithReference,
} from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import {
  type ChildNode,
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
  getOneOfChildNodeMapList,
  getOneOfKeyInfo,
  getVirtualReferencesMap,
  processValueWithCondition,
  processValueWithOneOfSchema,
} from './utils';

const RESET_NODE_OPTION = SetValueOption.Replace | SetValueOption.Propagate;

export class BranchStrategy implements ObjectNodeStrategy {
  /** Host ObjectNode instance that this strategy belongs to */
  private readonly __host__: ObjectNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: Fn<[ObjectValue | undefined]>;

  /** Callback function to handle refresh operations */
  private readonly __handleRefresh__: Fn<[ObjectValue | undefined]>;

  /** Callback function to handle computed properties updates */
  private readonly __handleUpdateComputedProperties__: Fn;

  /** Array of schema property keys in order */
  private readonly __schemaKeys__: string[];

  /** Set of all oneOf schema keys, undefined if no oneOf schema exists */
  private readonly __oneOfKeySet__?: Set<string>;

  /** Array of key sets for each oneOf branch, undefined if no oneOf schema exists */
  private readonly __oneOfKeySetList__?: Set<string>[];

  /** Array of child node arrays for each oneOf branch */
  private readonly __oneOfChildNodeMapList__?: Map<string, ChildNode>[];

  /** Array of child nodes for regular properties (non-oneOf) */
  private readonly __propertyChildren__: ChildNode[];

  /** Map of field conditions for conditional schema properties */
  private readonly __fieldConditionMap__?: FieldConditionMap;

  /** Map of property keys to child nodes */
  private readonly __childNodeMap__: Map<string, ChildNode>;

  /** Current active children nodes (combination of property and oneOf children) */
  private __children__: ChildNode[];
  /**
   * Gets the child nodes of the object node.
   * @returns List of child nodes
   */

  public get children() {
    return this.__children__;
  }

  /** Flag indicating whether the node is in isolation mode (affects condition processing) */
  private __isolationMode__: boolean = false;

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /** Current committed value of the object node */
  private __value__: ObjectValue | undefined;

  /** Draft value containing pending changes before commit */
  private __draft__: ObjectValue | undefined;

  /**
   * Gets the current value of the object.
   * @returns Current value of the object node or undefined
   */
  public get value() {
    return this.__value__;
  }

  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  public applyValue(input: ObjectValue, option: UnionSetValueOption) {
    this.__draft__ = input;
    this.__isolationMode__ = !!(option & SetValueOption.IsolationMode);
    this.__publishRequestEmitChange__(option);
  }

  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  public activate() {
    for (const child of this.__propertyChildren__)
      (child.node as AbstractNode).activate(this.__host__);
    if (this.__oneOfChildNodeMapList__)
      for (const childNodeMap of this.__oneOfChildNodeMapList__)
        for (const childNode of childNodeMap.values())
          (childNode.node as AbstractNode).activate(this.__host__);
  }

  /**
   * Initializes the BranchStrategy object.
   * @param host - Host ObjectNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   * @param handleUpdateComputedProperties - Computed properties update handler
   * @param nodeFactory - Node creation factory
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

    this.__value__ = host.defaultValue;
    this.__draft__ = {};

    const jsonSchema = host.jsonSchema;

    this.__fieldConditionMap__ = getFieldConditionMap(jsonSchema);

    const propertyKeys = sortWithReference(
      getObjectKeys(jsonSchema.properties),
      jsonSchema.propertyKeys,
    );

    const oneOfKeyInfo = getOneOfKeyInfo(jsonSchema);
    if (oneOfKeyInfo) {
      this.__oneOfKeySet__ = oneOfKeyInfo.oneOfKeySet;
      this.__oneOfKeySetList__ = oneOfKeyInfo.oneOfKeySetList;
      this.__schemaKeys__ = sortWithReference(
        [...propertyKeys, ...Array.from(this.__oneOfKeySet__)],
        jsonSchema.propertyKeys,
      );
    } else this.__schemaKeys__ = propertyKeys;

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(host.name, propertyKeys, host.jsonSchema.virtual);
    const handelChangeFactory = (propertyKey: string) => (input: unknown) => {
      if (!this.__draft__) this.__draft__ = {};
      if (input !== undefined && this.__draft__[propertyKey] === input) return;
      this.__draft__[propertyKey] = input;
      this.__publishRequestEmitChange__();
    };
    host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange)
        this.__emitChange__(payload?.[NodeEventType.RequestEmitChange]);
    });

    this.__childNodeMap__ = getChildNodeMap(
      host,
      jsonSchema,
      propertyKeys,
      host.defaultValue,
      this.__fieldConditionMap__,
      virtualReferenceFieldsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.__propertyChildren__ = getChildren(
      host,
      propertyKeys,
      this.__childNodeMap__,
      virtualReferenceFieldsMap,
      virtualReferencesMap,
      nodeFactory,
    );

    this.__oneOfChildNodeMapList__ = getOneOfChildNodeMapList(
      host,
      jsonSchema,
      host.defaultValue,
      this.__childNodeMap__,
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
   * Reflects value changes and publishes related events.
   * @param option - Setting options
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
   * Parses input value and processes it as an object.
   * @param input - Object to parse
   * @returns {ObjectValue|undefined} Parsed object
   * @private
   */
  private __parseValue__(input: ObjectValue) {
    const value = sortObjectKeys(input, this.__schemaKeys__, true);
    if (this.__isolationMode__)
      return processValueWithCondition(value, this.__fieldConditionMap__);
    return value;
  }

  /**
   * Propagates value changes to child nodes.
   * @param replace - Whether to replace existing values
   * @param option - Setting options
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

  /** Previously active oneOf index for tracking oneOf branch changes */
  private __previousIndex__: number = -1;

  /**
   * Updates child nodes when oneOf index changes, if oneOf schema exists.
   * @private
   */
  private __prepareOneOfChildren__() {
    if (!this.__oneOfChildNodeMapList__) return;
    this.__host__.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const current = this.__host__.oneOfIndex;
        const previous = this.__previousIndex__;
        if (!this.__isolationMode__ && current === previous) return;

        const previousOneOfChildNodeMap =
          previous > -1
            ? this.__oneOfChildNodeMapList__?.[previous]
            : undefined;
        if (previousOneOfChildNodeMap)
          for (const childNode of previousOneOfChildNodeMap.values())
            childNode.node.resetNode(false);

        const oneOfChildNodeMap =
          current > -1 ? this.__oneOfChildNodeMapList__?.[current] : undefined;
        if (oneOfChildNodeMap)
          for (const childNode of oneOfChildNodeMap.values())
            childNode.node.resetNode(
              this.__isolationMode__,
              this.__value__?.[childNode.node.propertyKey],
            );

        if (oneOfChildNodeMap) {
          const children: ChildNode[] = [];
          for (let index = 0; index < this.__schemaKeys__.length; index++) {
            const key = this.__schemaKeys__[index];
            const childNode =
              this.__childNodeMap__?.get(key) || oneOfChildNodeMap?.get(key);
            if (childNode) children.push(childNode);
          }
          this.__children__ = children;
        } else this.__children__ = this.__propertyChildren__;

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
   * Publishes a child node change event.
   * @private
   */
  private __publishChildrenChange__() {
    if (this.__locked__) return;
    this.__host__.publish({ type: NodeEventType.UpdateChildren });
  }

  /**
   * Publishes a value change request event.
   * @param option - Change options (optional)
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
