import { sortWithReference } from '@winglet/common-utils/array';
import { getObjectKeys, sortObjectKeys } from '@winglet/common-utils/object';

import type { Fn, Nullish } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';
import {
  type ChildNode,
  type HandleChange,
  NodeEventType,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import type { ObjectValue } from '@/schema-form/types';

import type { ObjectNodeStrategy } from '../type';
import {
  type FieldConditionMap,
  checkEmptyDraft,
  getChildNodeMap,
  getChildren,
  getConditionsMap,
  getFieldConditionMap,
  getOneOfChildNodeMapList,
  getOneOfKeyInfo,
  getVirtualReferencesMap,
  processValueWithCondition,
  processValueWithOneOfSchema,
} from './utils';

export class BranchStrategy implements ObjectNodeStrategy {
  /** Host ObjectNode instance that this strategy belongs to */
  private readonly __host__: ObjectNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ObjectValue | Nullish>;

  /** Callback function to handle refresh operations */
  private readonly __handleRefresh__: Fn<[ObjectValue | Nullish]>;

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
  private __isolated__: boolean = false;

  /** Flag indicating whether the strategy is already processing a batch */
  private __batched__: boolean = false;

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /** Current committed value of the object node */
  private __value__: ObjectValue | Nullish;

  /** Draft value containing pending changes before commit */
  private __draft__: ObjectValue | Nullish;

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
  public applyValue(input: ObjectValue | Nullish, option: UnionSetValueOption) {
    this.__draft__ = input;
    this.__isolated__ = !!(option & SetValueOption.Isolate);
    this.__emitChange__(option, false);
  }

  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  public activate() {
    let enabled = false;
    for (const child of this.__propertyChildren__) {
      (child.node as AbstractNode).activate(this.__host__);
      if (!enabled && child.node.computeEnabled) enabled = true;
    }
    if (this.__oneOfChildNodeMapList__)
      for (const childNodeMap of this.__oneOfChildNodeMapList__)
        for (const child of childNodeMap.values()) {
          (child.node as AbstractNode).activate(this.__host__);
          if (!enabled && child.node.computeEnabled) enabled = true;
        }
    if (enabled) this.__prepareProcessComputedProperties__();
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
    handleChange: HandleChange<ObjectValue | Nullish>,
    handleRefresh: Fn<[ObjectValue | Nullish]>,
    handleSetDefaultValue: Fn<[ObjectValue | Nullish]>,
    handleUpdateComputedProperties: Fn,
    nodeFactory: SchemaNodeFactory,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;
    this.__handleUpdateComputedProperties__ = handleUpdateComputedProperties;

    this.__value__ = host.defaultValue;
    this.__draft__ = host.defaultValue === null ? null : {};

    const jsonSchema = host.jsonSchema;

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

    const handelChangeFactory =
      (key: string): HandleChange =>
      (input, batch) => {
        if (!this.__draft__) this.__draft__ = {};
        if (input !== undefined && this.__draft__[key] === input) return;
        this.__draft__[key] = input;
        if (this.__isolated__ && !this.__oneOfChildNodeMapList__)
          this.__isolated__ = false;
        this.__emitChange__(SetValueOption.Default, batch);
      };
    host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange) {
        this.__handleEmitChange__(payload?.[NodeEventType.RequestEmitChange]);
        this.__batched__ = false;
      }
    });

    const { virtualReferencesMap, virtualReferenceFieldsMap } =
      getVirtualReferencesMap(host.name, propertyKeys, host.jsonSchema.virtual);

    this.__fieldConditionMap__ = getFieldConditionMap(jsonSchema);

    const conditionsMap = getConditionsMap(this.__fieldConditionMap__);

    this.__childNodeMap__ = getChildNodeMap(
      host,
      jsonSchema,
      propertyKeys,
      host.defaultValue,
      conditionsMap,
      virtualReferencesMap,
      virtualReferenceFieldsMap,
      handelChangeFactory,
      nodeFactory,
    );

    this.__propertyChildren__ = getChildren(
      host,
      propertyKeys,
      this.__childNodeMap__,
      conditionsMap,
      virtualReferencesMap,
      virtualReferenceFieldsMap,
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

    this.__emitChange__(SetValueOption.Default);
    handleSetDefaultValue(this.__value__);
    this.__publishChildrenChange__();

    this.__prepareOneOfChildren__();
  }

  /**
   * Determines whether to queue or immediately process value changes.
   *
   * In batch mode: Publishes RequestEmitChange event for deferred processing
   * In sync mode: Immediately calls handleEmitChange for instant updates
   *
   * @param option - Change options (optional)
   * @private
   */
  private __emitChange__(option: UnionSetValueOption, batch: boolean = false) {
    if (this.__locked__) return;
    if (batch) {
      if (this.__batched__) return;
      this.__batched__ = true;
      this.__host__.publish({
        type: NodeEventType.RequestEmitChange,
        payload: { [NodeEventType.RequestEmitChange]: option },
      });
    } else this.__handleEmitChange__(option);
  }

  /**
   * Reflects value changes and publishes related events.
   * @param option - Setting options
   * @private
   */
  private __handleEmitChange__(
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    if (this.__locked__) return;

    const replace = !!(option & SetValueOption.Replace);
    const previous = this.__value__ ? { ...this.__value__ } : this.__value__;
    const current = this.__parseValue__(
      this.__value__,
      this.__draft__,
      this.__host__.nullable,
      replace,
    );

    if (current === false) return;
    this.__value__ = current;

    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, !!(option & SetValueOption.Batch));
    if (option & SetValueOption.Propagate) this.__propagate__(replace, option);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.Isolate)
      this.__handleUpdateComputedProperties__();
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: { previous, current },
        },
      });

    this.__draft__ = {};
  }

  /**
   * Parses input value and processes it as an object.
   * @param base - Base object to parse
   * @param draft - Draft object to parse
   * @param nullable - Whether the object is nullable
   * @param replace - Whether to replace the existing value
   * @returns {ObjectValue} Processed object
   * @private
   */
  private __parseValue__(
    base: ObjectValue | Nullish,
    draft: ObjectValue | Nullish,
    nullable: boolean,
    replace: boolean,
  ) {
    if (draft === undefined) return undefined;
    if (draft === null) return nullable ? null : {};
    if (replace || base == null) return this.__processValue__(draft);
    if (checkEmptyDraft(draft)) return false;
    return this.__processValue__({ ...base, ...draft });
  }

  /**
   * Processes input value and processes it as an object.
   * @param input - Object to parse
   * @returns {ObjectValue} Parsed object
   * @private
   */
  private __processValue__(input: ObjectValue) {
    const value = sortObjectKeys(input, this.__schemaKeys__, true);
    if (this.__isolated__)
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
    const nullify = this.__draft__ === null;
    for (let i = 0, l = this.__children__.length; i < l; i++) {
      const node = this.__children__[i].node;
      if (node.type === 'virtual') continue;
      const key = node.propertyKey;
      if (replace || nullify || (key in draft && key in target))
        node.setValue(nullify ? null : target[key], option);
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
        if (!this.__oneOfChildNodeMapList__) return;

        const current = this.__host__.oneOfIndex;
        const previous = this.__previousIndex__;
        const isolation = this.__isolated__;

        if (isolation) this.__isolated__ = false;
        if (!isolation && current === previous) return;

        this.__locked__ = true;
        const previousOneOfChildNodeMap =
          previous > -1 ? this.__oneOfChildNodeMapList__[previous] : undefined;
        if (previousOneOfChildNodeMap)
          for (const child of previousOneOfChildNodeMap.values())
            child.node.resetNode(false);

        const oneOfChildNodeMap =
          current > -1 ? this.__oneOfChildNodeMapList__[current] : undefined;
        if (oneOfChildNodeMap)
          for (const child of oneOfChildNodeMap.values()) {
            const node = child.node;
            node.resetNode(isolation, this.__value__?.[node.propertyKey]);
          }

        if (oneOfChildNodeMap) {
          const children: ChildNode[] = [];
          for (let i = 0, l = this.__schemaKeys__.length; i < l; i++) {
            const key = this.__schemaKeys__[i];
            const childNode =
              this.__childNodeMap__.get(key) || oneOfChildNodeMap.get(key);
            if (childNode) children.push(childNode);
          }
          this.__children__ = children;
        } else this.__children__ = this.__propertyChildren__;
        this.__locked__ = false;

        this.__draft__ = processValueWithOneOfSchema(
          this.__processValue__({
            ...(this.__value__ || {}),
            ...(this.__draft__ || {}),
          }),
          this.__oneOfKeySet__,
          current > -1 ? this.__oneOfKeySetList__?.[current] : undefined,
        );

        for (let i = 0, l = this.__children__.length; i < l; i++) {
          const node = this.__children__[i].node;
          if (node.type === 'virtual') continue;
          if (node.visible) continue;
          if (!this.__draft__) this.__draft__ = {};
          this.__draft__[node.propertyKey] = undefined;
        }

        this.__emitChange__(SetValueOption.ResetNode);
        this.__publishChildrenChange__();
        this.__previousIndex__ = current;
      }
    });
  }

  /**
   * Prepares the process computed properties.
   * Excludes values of invisible child elements from the computed value.
   * @private
   */
  private __prepareProcessComputedProperties__() {
    this.__host__.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateValue) {
        let processed = false;
        for (let i = 0, l = this.__children__.length; i < l; i++) {
          const node = this.__children__[i].node;
          if (node.type === 'virtual') continue;
          if (node.visible) continue;
          if (!this.__draft__) this.__draft__ = {};
          this.__draft__[node.propertyKey] = undefined;
          processed = true;
        }
        if (processed) this.__emitChange__(SetValueOption.BatchedEmitChange);
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
}
