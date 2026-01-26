import {
  differenceLite,
  primitiveArrayEqual,
  sortWithReference,
} from '@winglet/common-utils/array';
import { isEmptyObject } from '@winglet/common-utils/filter';
import { getObjectKeys, sortObjectKeys } from '@winglet/common-utils/object';

import type { Fn, Nullish } from '@aileron/declare';

import { ENHANCED_KEY } from '@/schema-form/app/constants';
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
import { joinSegment } from '@/schema-form/helpers/jsonPointer';
import { isTerminalType } from '@/schema-form/helpers/jsonSchema';
import type { ObjectValue } from '@/schema-form/types';

import type { ObjectNodeStrategy } from '../type';
import type { ChildNodeMap } from './type';
import {
  type FieldConditionMap,
  getChildNodeMap,
  getChildren,
  getCompositionKeyInfo,
  getCompositionNodeMapList,
  getConditionsMap,
  getFieldConditionMap,
  getVirtualReferencesMap,
  processValueWithCondition,
  processValueWithValidate,
  validateSchemaType,
} from './utils';

export class BranchStrategy implements ObjectNodeStrategy {
  /** Host ObjectNode instance that this strategy belongs to */
  private readonly __host__: ObjectNode;

  /** Flag indicating whether to ignore additional properties */
  private readonly __ignoreAdditionalProperties__: boolean;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ObjectValue | Nullish>;

  /** Array of schema property keys in order */
  private readonly __propertyKeys__: string[];

  /** Map of field conditions for conditional schema properties */
  private readonly __fieldConditionMap__?: FieldConditionMap;

  /** Map of property keys to child nodes */
  private readonly __childNodeMap__: ChildNodeMap;

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

  /** Flag indicating whether the object value is expired */
  private __expired__: boolean = true;

  /**
   * Determines whether to queue or immediately process value changes.
   *
   * In batch mode: Publishes RequestEmitChange event for deferred processing
   * In sync mode: Immediately calls handleEmitChange for instant updates
   *
   * @param option - Change options (optional)
   * @private
   */
  private __emitChange__(
    option: UnionSetValueOption,
    batched: boolean = false,
  ) {
    if (this.__locked__) return;
    if (batched) {
      if (this.__batched__) return;
      this.__batched__ = true;
      this.__host__.publish(NodeEventType.RequestEmitChange, option);
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
    const host = this.__host__;
    const replace = (option & SetValueOption.Replace) > 0;
    const normalize = (option & SetValueOption.Normalize) > 0;
    const settled = (option & SetValueOption.Isolate) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;

    const base = this.__value__;
    const draft = this.__draft__;
    const previous = base ? { ...base } : base;
    const current = this.__parseValue__(
      base,
      draft,
      replace,
      normalize,
      host.nullable,
    );

    if (current === false) return;

    this.__value__ = current;
    this.__draft__ = {};

    if (this.__expired__) this.__expired__ = false;
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, (option & SetValueOption.Batch) > 0);
    if (option & SetValueOption.Propagate)
      this.__propagate__(current, draft, replace, option);
    if (option & SetValueOption.Refresh)
      host.publish(NodeEventType.RequestRefresh);
    // @ts-expect-error [internal] computed property update
    if (option & SetValueOption.Isolate) host.__updateComputedProperties__();
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, settled, inject },
        settled && host.initialized,
      );
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
    replace: boolean,
    normalize: boolean,
    nullable: boolean,
  ) {
    if (draft === undefined) return undefined;
    if (draft === null) return nullable ? null : {};
    if (replace || base == null) return this.__processValue__(draft, normalize);
    // @ts-expect-error [internal] equals delegation
    if (isEmptyObject(draft) || this.__host__.__equals__(base, draft))
      return false;
    return this.__processValue__({ ...base, ...draft }, normalize);
  }

  /**
   * Processes input value and processes it as an object.
   * @param input - Object to parse
   * @returns {ObjectValue} Parsed object
   * @private
   */
  private __processValue__(input: ObjectValue, normalize?: boolean) {
    const value = sortObjectKeys(input, this.__propertyKeys__, {
      ignoreUndefinedKey: this.__ignoreAdditionalProperties__ || normalize,
      ignoreUndefinedValue: true,
    });
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
  private __propagate__(
    source: ObjectValue | Nullish,
    target: ObjectValue | Nullish,
    replace: boolean,
    option: UnionSetValueOption,
  ) {
    const current = source || {};
    const committed = target || {};
    const nullify = target === null;
    const propagateOption =
      target == null ? option & ~SetValueOption.EmitChange : option;
    this.__locked__ = true;
    for (let i = 0, l = this.__children__.length; i < l; i++) {
      const node = this.__children__[i].node;
      if (node.type === 'virtual') continue;
      const name = node.name;
      if (replace || nullify || (name in committed && name in current))
        node.setValue(nullify ? null : current[name], propagateOption);
    }
    this.__locked__ = false;
  }

  /**
   * Gets the current value of the object.
   * @returns Current value of the object node or undefined
   */
  public get value() {
    if (this.__expired__)
      this.__handleEmitChange__(SetValueOption.BatchedEmitChange);
    return this.__value__;
  }

  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  public applyValue(input: ObjectValue | Nullish, option: UnionSetValueOption) {
    this.__draft__ = input;
    this.__expired__ = true;
    this.__isolated__ = (option & SetValueOption.Isolate) > 0;
    this.__emitChange__(option);
  }

  /** Array of child nodes for regular properties (non-oneOf) */
  private readonly __propertyChildren__: ChildNode[];

  /** Current active children nodes (combination of property and oneOf children) */
  private __children__: ChildNode[];

  /** Array of child nodes for regular properties and oneOf properties */
  private readonly __subnodes__: ChildNode[];

  /**
   * Publishes a child node change event.
   * @private
   */
  private __publishChildrenChange__() {
    if (this.__locked__) return;
    this.__host__.publish(NodeEventType.UpdateChildren);
  }

  /**
   * Gets the child nodes of the object node.
   * @returns List of child nodes
   */
  public get children() {
    return this.__children__;
  }

  /**
   * Gets all of the child nodes of the object node.
   * @returns List of child nodes
   */
  public get subnodes() {
    return this.__subnodes__;
  }

  /** Set of all oneOf schema keys, undefined if no oneOf schema exists */
  private readonly __oneOfKeySet__?: Set<string>;

  /** Array of key sets for each oneOf branch, undefined if no oneOf schema exists */
  private readonly __oneOfKeySetList__?: Set<string>[];

  /** Array of child node arrays for each oneOf branch */
  private readonly __oneOfChildNodeMapList__?: ChildNodeMap[];

  /** Previously active oneOf index for tracking oneOf branch changes */
  private __oneOfIndex__: number = -1;

  /** Active oneOf child node map */
  private __oneOfChildNodeMap__: ChildNodeMap | null = null;

  /** Set of all anyOf schema keys, undefined if no anyOf schema exists */
  private readonly __anyOfKeySet__?: Set<string>;

  /** Array of key sets for each anyOf branch, undefined if no anyOf schema exists */
  private readonly __anyOfKeySetList__?: Set<string>[];

  /** Array of child node arrays for each anyOf branch */
  private readonly __anyOfChildNodeMapList__?: ChildNodeMap[];

  /** Previously active anyOf index for tracking anyOf branch changes */
  private __anyOfIndices__: number[] = [];

  /** Active anyOf child node maps */
  private __anyOfChildNodeMaps__: ChildNodeMap[] | null = null;

  /** Function to validate composition value */
  private __validateAllowedKey__: Fn<[key: string], boolean> | undefined;

  /** Whether the object node has no oneOf and anyOf schema */
  private get __isPristine__() {
    return (
      this.__oneOfChildNodeMapList__ === undefined &&
      this.__anyOfChildNodeMapList__ === undefined
    );
  }

  /**
   * Updates child nodes when oneOf index changes, if oneOf schema exists.
   * @private
   */
  private __prepareCompositionChildren__() {
    if (this.__isPristine__) return;
    this.__validateAllowedKey__ = this.__createAllowedKeyValidator__();
    this.__host__.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const isolation = this.__isolated__;
        const skipOneOfUpdate = this.__processOneOfChildren__(isolation);
        const skipAnyOfUpdate = this.__processAnyOfChildren__(isolation);
        if (skipOneOfUpdate && skipAnyOfUpdate) return;
        if (isolation) this.__isolated__ = false;
        this.__processChildren__();
        this.__processCompositionValue__(isolation);
      }
    });
  }

  /**
   * Updates child nodes when oneOf index changes, if oneOf schema exists.
   * @private
   */
  private __processOneOfChildren__(isolation: boolean) {
    if (this.__oneOfChildNodeMapList__ === undefined) return true;

    const current = this.__host__.oneOfIndex;
    const previous = this.__oneOfIndex__;

    if (!isolation && current === previous) return true;

    const oneOfChildNodeMap =
      current > -1 ? this.__oneOfChildNodeMapList__[current] : null;

    this.__locked__ = true;
    const previousOneOfChildNodeMap =
      previous > -1 ? this.__oneOfChildNodeMapList__[previous] : null;
    if (previousOneOfChildNodeMap)
      for (const child of previousOneOfChildNodeMap.values()) {
        // @ts-expect-error [internal] reset child node
        child.node.__reset__({ updateScoped: true });
      }
    if (oneOfChildNodeMap)
      for (const child of oneOfChildNodeMap.values()) {
        const node = child.node;
        const previousNode = previousOneOfChildNodeMap?.get(node.name)?.node;
        const previousValue = this.__value__?.[node.name];
        // @ts-expect-error [internal] reset child node
        node.__reset__({
          updateScoped: true,
          preferLatest:
            isolation ||
            (node.type === previousNode?.type && isTerminalType(node.type)),
          applyDerivedValue: true,
          checkDefaultValueFirst: isolation === false,
          fallbackValue: validateSchemaType(
            previousValue,
            node.type,
            node.nullable,
          )
            ? previousValue
            : undefined,
        });
        // @ts-expect-error [internal] recursive computed property update
        node.__updateComputedPropertiesRecursively__();
      }
    this.__locked__ = false;

    this.__oneOfIndex__ = current;
    this.__oneOfChildNodeMap__ = oneOfChildNodeMap;

    return false;
  }

  /**
   * Updates child nodes when anyOf indices change, if anyOf schema exists.
   * @param isolation - Whether the operation is in isolation mode
   * @returns Array of active anyOf child node maps, null if no change needed, or undefined if no active anyOf branches
   * @private
   */
  private __processAnyOfChildren__(isolation: boolean) {
    if (this.__anyOfChildNodeMapList__ === undefined) return true;

    const current = this.__host__.anyOfIndices;
    const previous = this.__anyOfIndices__;

    if (!isolation && primitiveArrayEqual(current, previous)) return true;

    const anyOfChildNodeMaps = new Array<ChildNodeMap>(current.length);
    for (let i = 0, l = current.length; i < l; i++)
      anyOfChildNodeMaps[i] = this.__anyOfChildNodeMapList__[current[i]];

    this.__locked__ = true;
    const disables = isolation ? previous : differenceLite(previous, current);
    if (disables.length > 0)
      for (let i = 0, l = disables.length; i < l; i++) {
        const anyOfChildNodes =
          this.__anyOfChildNodeMapList__[disables[i]].values();
        for (const child of anyOfChildNodes) {
          // @ts-expect-error [internal] reset child node
          child.node.__reset__({ updateScoped: true });
        }
      }
    const enables = isolation ? current : differenceLite(current, previous);
    if (enables.length > 0)
      for (let i = 0, l = enables.length; i < l; i++) {
        const anyOfChildNodes =
          this.__anyOfChildNodeMapList__[enables[i]].values();
        for (const child of anyOfChildNodes) {
          const node = child.node;
          // @ts-expect-error [internal] reset child node
          node.__reset__({
            updateScoped: true,
            preferLatest: isolation,
            applyDerivedValue: true,
            fallbackValue: this.__value__?.[node.name],
          });
          // @ts-expect-error [internal] recursive computed property update
          node.__updateComputedPropertiesRecursively__();
        }
      }
    this.__locked__ = false;

    this.__anyOfIndices__ = current;
    this.__anyOfChildNodeMaps__ =
      anyOfChildNodeMaps.length > 0 ? anyOfChildNodeMaps : null;

    return false;
  }

  /**
   * Updates the active children array based on current oneOf and anyOf selections.
   * @param oneOfChildNodeMap - Active oneOf child node map (null if no oneOf or none selected)
   * @param anyOfChildNodeMaps - Array of active anyOf child node maps (null if no anyOf or none selected)
   * @private
   */
  private __processChildren__() {
    const oneOfChildNodeMap = this.__oneOfChildNodeMap__;
    const anyOfChildNodeMaps = this.__anyOfChildNodeMaps__;
    if (oneOfChildNodeMap === null && anyOfChildNodeMaps === null)
      this.__children__ = this.__propertyChildren__;
    else {
      const keys = this.__propertyKeys__;
      const children: ChildNode[] = [];
      for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
        const childNode =
          this.__childNodeMap__.get(k) ||
          oneOfChildNodeMap?.get(k) ||
          anyOfChildNodeMaps?.find((map) => map.has(k))?.get(k);
        if (childNode) children.push(childNode);
      }
      this.__children__ = children;
    }
    this.__publishChildrenChange__();
  }

  /**
   * Processes and validates the object value according to active composition branches.
   * Filters out properties that are not allowed by current oneOf/anyOf selections.
   * @param isolation - Whether the operation is in isolation mode
   * @private
   */
  private __processCompositionValue__(isolation: boolean) {
    this.__draft__ = processValueWithValidate(
      this.__processValue__({ ...this.__value__, ...this.__draft__ }),
      this.__validateAllowedKey__,
    );
    this.__expired__ = false;
    this.__processComputedProperties__(this.__draft__);
    // @ts-expect-error [internal] validationEnabled delegation
    if (this.__host__.__validationEnabled__)
      // @ts-expect-error [internal] enhancer adjustment
      this.__host__.__adjustEnhancer__(
        joinSegment(this.__host__.path, ENHANCED_KEY),
        this.__oneOfIndex__,
      );
    this.__emitChange__(
      isolation ? SetValueOption.IsolateReset : SetValueOption.Reset,
    );
  }

  /**
   * Creates a validator function that determines whether a property key is allowed
   * based on the current oneOf and anyOf selections.
   * @returns Function that validates if a property key should be included in the object value
   * @private
   */
  private __createAllowedKeyValidator__() {
    return (key: string) => {
      if (
        this.__oneOfKeySet__?.has(key) &&
        this.__oneOfKeySetList__ !== undefined
      )
        if (this.__oneOfIndex__ > -1)
          return this.__oneOfKeySetList__[this.__oneOfIndex__].has(key);
        else return false;
      if (
        this.__anyOfKeySet__?.has(key) &&
        this.__anyOfKeySetList__ !== undefined
      )
        if (this.__anyOfIndices__.length > 0) {
          for (let i = 0, l = this.__anyOfIndices__.length; i < l; i++)
            if (this.__anyOfKeySetList__[this.__anyOfIndices__[i]].has(key))
              return true;
          return false;
        } else return false;
      return true;
    };
  }

  /**
   * Prepares the process computed properties.
   * @private
   */
  private __prepareProcessComputedProperties__() {
    this.__host__.subscribe(({ type, options }) => {
      if (type & NodeEventType.UpdateValue) {
        if (options?.[NodeEventType.UpdateValue]?.settled) return;
        if (this.__processComputedProperties__(this.__value__)) return;
        this.__emitChange__(SetValueOption.BatchedEmitChange);
      }
    });
  }

  /**
   * Excludes values of invisible child elements from the computed value.
   * @param source - Source object to check
   * @returns Whether the computed properties were processed
   * @private
   */
  private __processComputedProperties__(source: ObjectValue | Nullish) {
    if (!source || !this.__draft__) return false;
    let noop = true;
    for (let i = 0, l = this.__children__.length; i < l; i++) {
      const node = this.__children__[i].node;
      if (node.type === 'virtual') continue;
      if (node.active) continue;
      const name = node.name;
      if (source[name] === undefined) continue;
      this.__draft__[name] = undefined;
      if (noop) noop = false;
    }
    return noop;
  }

  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  public initialize() {
    let enabled = false;
    for (let i = 0, l = this.__subnodes__.length; i < l; i++) {
      const childNode = this.__subnodes__[i].node;
      // @ts-expect-error [internal] child node initialization
      (childNode as AbstractNode).__initialize__(this.__host__);
      // @ts-expect-error [internal] computeEnabled delegation
      if (!enabled && childNode.__computeEnabled__) enabled = true;
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
    nodeFactory: SchemaNodeFactory,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;

    this.__value__ = host.defaultValue;
    this.__draft__ = host.defaultValue === null ? null : {};

    const jsonSchema = host.jsonSchema;

    this.__ignoreAdditionalProperties__ =
      jsonSchema.additionalProperties === false;

    const propertyKeys = sortWithReference(
      getObjectKeys(jsonSchema.properties),
      jsonSchema.propertyKeys,
    );

    const oneOfKeyInfo = getCompositionKeyInfo('oneOf', jsonSchema);
    if (oneOfKeyInfo) {
      this.__oneOfKeySet__ = oneOfKeyInfo.unionKeySet;
      this.__oneOfKeySetList__ = oneOfKeyInfo.schemaKeySets;
    }

    const anyOfKeyInfo = getCompositionKeyInfo('anyOf', jsonSchema);
    if (anyOfKeyInfo) {
      this.__anyOfKeySet__ = anyOfKeyInfo.unionKeySet;
      this.__anyOfKeySetList__ = anyOfKeyInfo.schemaKeySets;
    }

    if (this.__oneOfKeySet__ || this.__anyOfKeySet__) {
      this.__propertyKeys__ = sortWithReference(
        [
          ...propertyKeys,
          ...(this.__oneOfKeySet__ ? Array.from(this.__oneOfKeySet__) : []),
          ...(this.__anyOfKeySet__ ? Array.from(this.__anyOfKeySet__) : []),
        ],
        jsonSchema.propertyKeys,
      );
    } else this.__propertyKeys__ = propertyKeys;

    const handelChangeFactory =
      (property: string): HandleChange =>
      (input, batched) => {
        if (this.__draft__ == null) this.__draft__ = {};
        if (
          (input === undefined && this.__value__?.[property] === input) ||
          (input !== undefined && this.__draft__[property] === input)
        )
          return;
        this.__draft__[property] = input;
        this.__expired__ = true;
        if (this.__isolated__ && this.__isPristine__) this.__isolated__ = false;
        this.__emitChange__(SetValueOption.Default, batched);
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

    this.__oneOfChildNodeMapList__ = getCompositionNodeMapList(
      host,
      'oneOf',
      jsonSchema,
      host.defaultValue,
      this.__childNodeMap__,
      this.__oneOfKeySetList__,
      this.__anyOfKeySet__,
      handelChangeFactory,
      nodeFactory,
    );

    this.__anyOfChildNodeMapList__ = getCompositionNodeMapList(
      host,
      'anyOf',
      jsonSchema,
      host.defaultValue,
      this.__childNodeMap__,
      this.__anyOfKeySetList__,
      this.__oneOfKeySet__,
      handelChangeFactory,
      nodeFactory,
    );

    this.__children__ = this.__propertyChildren__;

    const subnodes = [...this.__propertyChildren__];
    if (this.__oneOfChildNodeMapList__)
      for (const childNodeMap of this.__oneOfChildNodeMapList__)
        for (const child of childNodeMap.values()) subnodes.push(child);
    if (this.__anyOfChildNodeMapList__)
      for (const childNodeMap of this.__anyOfChildNodeMapList__)
        for (const child of childNodeMap.values()) subnodes.push(child);
    this.__subnodes__ = subnodes;

    this.__locked__ = false;

    this.__emitChange__(SetValueOption.Default);
    // @ts-expect-error [internal] setDefaultValue delegation
    this.__host__.__setDefaultValue__(this.__value__);
    this.__publishChildrenChange__();

    this.__prepareCompositionChildren__();
  }
}
