import { isArray } from '@winglet/common-utils/filter';

import type { Fn, Nullish } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ArrayNode } from '@/schema-form/core/nodes/ArrayNode';
import {
  type ChildNode,
  type HandleChange,
  NodeEventType,
  type SchemaNode,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import type { AllowedValue, ArrayValue } from '@/schema-form/types';

import { resolveArrayLimits } from '../../utils';
import type { ArrayNodeStrategy } from '../type';
import type { ChildSegmentKey } from './type';
import { getChildSchema, promiseAfterMicrotask } from './utils';

export class BranchStrategy implements ArrayNodeStrategy {
  /** Host ArrayNode instance that this strategy belongs to */
  private readonly __host__: ArrayNode;

  /** Callback function to handle value changes */
  private readonly __handleChange__: HandleChange<ArrayValue | Nullish>;

  /** Callback function to handle refresh operations */
  private readonly __handleRefresh__: Fn<[ArrayValue | Nullish]>;

  /** Factory function for creating new schema nodes */
  private readonly __nodeFactory__: SchemaNodeFactory;

  /** Minimum number of items required in the array (from JSON Schema minItems) */
  private readonly __minItems__: number;

  /** Maximum number of items allowed in the array (from JSON Schema maxItems) */
  private readonly __maxItems__: number;

  /** Flag indicating whether the strategy is locked to prevent recursive updates */
  private __locked__: boolean = true;

  /** Flag indicating whether the strategy is already processing a batch */
  private __batched__: boolean = false;

  /** Revision counter for generating unique keys for array elements */
  private __revision__: number = 0;

  /** Array of unique keys for each element in the array, maintaining order */
  private __keys__: ChildSegmentKey[] = [];

  /** Map storing actual data and corresponding schema nodes for each array element */
  private __sourceMap__: Map<
    ChildSegmentKey,
    { data: AllowedValue; node: SchemaNode }
  > = new Map();

  /** Flag indicating whether the array value is not changed */
  private __idle__: boolean = false;

  private __nullish__: Nullish | false = false;

  /** Flag indicating whether the array edges are expired */
  private __expired__: boolean = true;

  /** Expire the array node's value and edges */
  private __expire__() {
    this.__idle__ = false;
    this.__nullish__ = false;
    this.__expired__ = true;
  }

  /** Current value of the array node */
  private __value__: ArrayValue = [];

  /**
   * Gets the current value of the array.
   * @returns Current value of the array node or undefined (if empty) or null (if nullable)
   */
  public get value() {
    if (this.__nullish__ == null) return this.__nullish__;
    else return this.__value__;
  }

  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   */
  public applyValue(input: ArrayValue | Nullish, option: UnionSetValueOption) {
    if (input == null) {
      this.__locked__ = true;
      this.clear(option);
      this.__locked__ = false;
      this.__nullish__ =
        input === null ? (this.__host__.nullable ? input : false) : undefined;
      this.__emitChange__(option, false);
    } else if (isArray(input)) {
      this.__locked__ = true;
      this.clear(option);
      for (const value of input) this.push(value, true, option);
      this.__locked__ = false;
      this.__emitChange__(option, false);
    }
  }

  private __children__: ChildNode[] = [];

  /**
   * Gets the child nodes of the array node.
   * @returns List of child nodes
   */
  public get children() {
    if (this.__expired__) {
      this.__children__ = this.__edges__;
      this.__expired__ = false;
    }
    return this.__children__;
  }

  /**
   * Gets the current length of the array.
   * @returns Length of the array
   */
  public get length() {
    return this.__keys__.length;
  }

  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  public initialize() {
    for (const key of this.__keys__)
      (this.__sourceMap__.get(key)?.node as AbstractNode)?.initialize(
        this.__host__,
      );
  }

  /**
   * Initializes the BranchStrategy object.
   * @param host - Host ArrayNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   * @param nodeFactory - Node creation factory
   */
  constructor(
    host: ArrayNode,
    hasDefault: boolean,
    handleChange: HandleChange<ArrayValue | Nullish>,
    handleRefresh: Fn<[ArrayValue | Nullish]>,
    handleSetDefaultValue: Fn<[ArrayValue | Nullish]>,
    nodeFactory: SchemaNodeFactory,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;
    this.__nodeFactory__ = nodeFactory;

    const limit = resolveArrayLimits(host.jsonSchema);
    this.__minItems__ = limit.min;
    this.__maxItems__ = limit.max;

    if (host.defaultValue === null) this.__nullish__ = null;

    if (hasDefault) {
      const defaultValue = host.defaultValue;
      if (defaultValue != null && defaultValue.length > 0)
        for (const value of defaultValue) this.push(value, true);
    } else while (this.length < this.__minItems__) this.push(void 0, true);

    host.subscribe(({ type, payload, options }) => {
      if (type & NodeEventType.RequestEmitChange) {
        this.__handleEmitChange__(
          payload?.[NodeEventType.RequestEmitChange],
          options?.[NodeEventType.RequestEmitChange],
        );
        this.__batched__ = false;
      }
    });

    this.__locked__ = false;
    this.__emitChange__(SetValueOption.Default, false);
    handleSetDefaultValue(this.value);
    this.__publishUpdateChildren__();
  }

  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional)
   * @returns Returns itself (this) for method chaining
   */
  public push(
    data?: ArrayValue[number],
    unlimited?: boolean,
    option?: UnionSetValueOption,
  ) {
    const host = this.__host__;
    if (unlimited !== true && this.__maxItems__ <= this.length)
      return promiseAfterMicrotask(this.length);

    const index = this.__keys__.length;
    const childSchema = getChildSchema(host.jsonSchema, index);
    if (childSchema === null) return promiseAfterMicrotask(this.length);

    const key = ('#' + this.__revision__++) as ChildSegmentKey;
    this.__keys__.push(key);

    const defaultValue = data !== undefined ? data : childSchema?.default;
    const childNode = this.__nodeFactory__({
      name: '' + index,
      scope: 'items',
      jsonSchema: childSchema,
      parentNode: host,
      defaultValue,
      onChange: this.__handleChangeFactory__(key),
      nodeFactory: this.__nodeFactory__,
    });
    this.__sourceMap__.set(key, { node: childNode, data: childNode.value });

    if (host.initialized) (childNode as AbstractNode).initialize(host);

    this.__expire__();
    this.__emitChange__(option);
    return promiseAfterMicrotask(this.length);
  }

  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   * @returns Returns itself (this) for method chaining
   */
  public update(
    index: number,
    data: ArrayValue[number],
    option?: UnionSetValueOption,
  ) {
    const node = this.__sourceMap__.get(this.__keys__[index])?.node;
    if (!node) return promiseAfterMicrotask(void 0);
    node.setValue(data, option);
    return promiseAfterMicrotask(node.value);
  }

  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   * @returns Returns itself (this) for method chaining
   */
  public remove(index: number, option?: UnionSetValueOption) {
    const targetId = this.__keys__[index];
    const removed = this.__sourceMap__.get(targetId);
    if (!removed) return promiseAfterMicrotask(void 0);

    this.__keys__ = this.__keys__.filter((key) => key !== targetId);
    this.__sourceMap__.delete(targetId);
    this.__updateChildName__();

    this.__expire__();
    this.__emitChange__(option);
    return promiseAfterMicrotask(removed.data);
  }

  /** Removes the last element from the array. */
  public pop() {
    if (this.length === 0) return promiseAfterMicrotask(void 0);
    return this.remove(this.length - 1);
  }

  /** Clears all elements to initialize the array. */
  public clear(option?: UnionSetValueOption) {
    for (let i = 0, l = this.__keys__.length; i < l; i++)
      this.__sourceMap__.get(this.__keys__[i])?.node.cleanUp(this.__host__);

    this.__keys__ = [];
    this.__sourceMap__.clear();
    this.__expire__();
    this.__emitChange__(option);
    return promiseAfterMicrotask(void 0);
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
  private __emitChange__(
    option: UnionSetValueOption = SetValueOption.BatchDefault,
    batched: boolean = true,
    updateChildren: boolean = true,
  ) {
    if (this.__locked__) return;
    if (batched) {
      if (this.__batched__) return;
      this.__batched__ = true;
      this.__host__.publish(
        NodeEventType.RequestEmitChange,
        option,
        updateChildren,
      );
    } else this.__handleEmitChange__(option, updateChildren);
  }

  /**
   * Emits a value change event.
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  private __handleEmitChange__(
    option: UnionSetValueOption = SetValueOption.Default,
    updateChildren: boolean = false,
  ) {
    if (this.__locked__ || this.__idle__) return;
    const host = this.__host__;
    const settled = (option & SetValueOption.Isolate) === 0;

    const previous = [...this.__value__];
    this.__value__ = this.__toArray__();
    const current = this.value;

    if (option & SetValueOption.EmitChange)
      this.__handleChange__(current, (option & SetValueOption.Batch) > 0);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current },
        settled && host.initialized,
      );

    this.__idle__ = true;
    if (updateChildren) this.__publishUpdateChildren__();
  }

  /**
   * Gets information about child nodes.
   * @returns Array containing key and node information
   * @private
   */
  private get __edges__() {
    const edges = new Array<ChildNode>(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const key = this.__keys__[i];
      edges[i] = { nonce: key, node: this.__sourceMap__.get(key)!.node };
    }
    return edges;
  }
  /**
   * Converts internal array state to an object array.
   * @returns Array containing the values of the array
   * @private
   */
  private __toArray__() {
    const values = new Array<AllowedValue>(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const edge = this.__sourceMap__.get(this.__keys__[i]);
      if (edge) values[i] = edge.data;
    }
    return values;
  }

  /**
   * Creates a function to handle value changes for a specific element.
   * @param key - Child node Key
   * @returns {HandleChange} Value change handler
   * @private
   */
  private __handleChangeFactory__(key: ChildSegmentKey): HandleChange {
    return (input, batched) => {
      const source = this.__sourceMap__.get(key);
      if (!source || source.data === input) return;
      source.data = input;
      this.__idle__ = false;
      this.__nullish__ = false;
      this.__emitChange__(SetValueOption.Default, batched, false);
    };
  }

  /**
   * Updates the names of array elements.
   * @private
   */
  private __updateChildName__() {
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const key = this.__keys__[i];
      if (this.__sourceMap__.has(key)) {
        const node = this.__sourceMap__.get(key)!.node;
        const name = '' + i;
        if (node.name !== name) node.setName(name, this.__host__);
      }
    }
  }

  /**
   * Publishes a child node update event.
   * @private
   */
  private __publishUpdateChildren__() {
    if (this.__locked__) return;
    this.__host__.publish(NodeEventType.UpdateChildren);
  }
}
